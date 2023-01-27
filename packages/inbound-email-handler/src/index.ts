/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Sentry from '@sentry/serverless'
import parseHeaders from 'parse-headers'
import * as multipart from 'parse-multipart-data'
import {
  handleConfirmation,
  isConfirmationEmail,
  parseUnsubscribe,
} from './newsletter'
import { PubSub } from '@google-cloud/pubsub'
import { handlePdfAttachment } from './pdf'
import { handleNewsletter } from '@omnivore/content-handler'
import axios from 'axios'
import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'

interface SaveReceivedEmailResponse {
  id: string
}

const signToken = promisify(jwt.sign)

const NEWSLETTER_EMAIL_RECEIVED_TOPIC = 'newsletterEmailReceived'
const NON_NEWSLETTER_EMAIL_TOPIC = 'nonNewsletterEmailReceived'
const pubsub = new PubSub()

export const publishMessage = async (
  topic: string,
  message: any
): Promise<string | undefined> => {
  return pubsub
    .topic(topic)
    .publishMessage({ json: message })
    .catch((err) => {
      console.log('error publishing message:', err)
      return undefined
    })
}

const saveReceivedEmail = async (
  email: string,
  data: any
): Promise<SaveReceivedEmailResponse> => {
  if (process.env.JWT_SECRET === undefined) {
    throw new Error('JWT_SECRET is not defined')
  }
  const auth = await signToken(email, process.env.JWT_SECRET)

  if (process.env.INTERNAL_SVC_ENDPOINT === undefined) {
    throw new Error('REST_BACKEND_ENDPOINT is not defined')
  }

  const response = await axios.post(
    `${process.env.INTERNAL_SVC_ENDPOINT}svc/pubsub/emails/save`,
    data,
    {
      headers: {
        Authorization: `${auth as string}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return response.data as SaveReceivedEmailResponse
}

export const inboundEmailHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    try {
      const parts = multipart.parse(req.body, 'xYzZY')
      const parsed: Record<string, string> = {}

      let pdfAttachment: Buffer | undefined
      let pdfAttachmentName: string | undefined

      for (const part of parts) {
        const { name, data, type, filename } = part
        if (name && data) {
          parsed[name] = data.toString()
        } else if (type === 'application/pdf' && data) {
          pdfAttachment = data
          pdfAttachmentName = filename
        } else {
          console.log('no data or name for ', part)
        }
      }

      const headers = parseHeaders(parsed.headers)
      console.log('parsed: ', parsed)
      console.log('headers: ', headers)

      // original sender email address
      const from = parsed['from']
      const subject = parsed['subject']
      const html = parsed['html']
      const text = parsed['text']

      // headers added when forwarding email by some rules in Gmail
      // e.g. 'X-Forwarded-To: recipient@omnivore.app'
      const forwardedTo = headers['x-forwarded-to']?.toString().split(',')[0]
      // x-forwarded-for is a space separated list of email address
      // the first one is the forwarding email sender and the last one is the recipient
      // e.g. 'X-Forwarded-For: sender@omnivore.app recipient@omnivore.app'
      const forwardedFrom = headers['x-forwarded-for']?.toString().split(' ')[0]

      // if an email is forwarded to the inbox, the to is the forwarding email recipient
      const to = forwardedTo || parsed['to']
      const postHeader = headers['list-post']?.toString()
      const unSubHeader = headers['list-unsubscribe']?.toString()

      const { id: receivedEmailId } = await saveReceivedEmail(to, {
        from,
        to,
        subject,
        html,
        text,
      })

      try {
        // check if it is a confirmation email or forwarding newsletter
        const newsletterMessage = await handleNewsletter({
          from,
          html,
          postHeader,
          unSubHeader,
          email: to,
          title: subject,
        })
        if (newsletterMessage) {
          await publishMessage(NEWSLETTER_EMAIL_RECEIVED_TOPIC, {
            ...newsletterMessage,
            receivedEmailId,
          })
          return res.status(200).send('newsletter received')
        }

        console.log('non-newsletter email from', from, 'to', to)

        if (isConfirmationEmail(from, subject)) {
          console.log('handleConfirmation', from)
          await handleConfirmation(to, subject)
          return res.send('ok')
        }

        if (pdfAttachment) {
          console.log('handle PDF attachment', from, to)
          await handlePdfAttachment(
            to,
            pdfAttachmentName,
            pdfAttachment,
            subject,
            receivedEmailId
          )
          return res.send('ok')
        }

        const unsubscribe = parseUnsubscribe(unSubHeader)
        // queue non-newsletter emails
        await pubsub.topic(NON_NEWSLETTER_EMAIL_TOPIC).publishMessage({
          json: {
            from,
            to,
            subject,
            html,
            text,
            unsubMailTo: unsubscribe.mailTo,
            unsubHttpUrl: unsubscribe.httpUrl,
            forwardedFrom,
            receivedEmailId,
          },
        })

        res.send('ok')
      } catch (error) {
        console.log('error handling emails, will forward.', from, to, subject)
        // queue error emails
        await pubsub.topic(NON_NEWSLETTER_EMAIL_TOPIC).publishMessage({
          json: {
            from,
            to,
            subject,
            html,
            text,
            forwardedFrom,
            receivedEmailId,
          },
        })
      }
    } catch (e) {
      console.log(e)
      res.send(e)
    }
  }
)
