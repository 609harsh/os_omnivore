import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@stitches/react'
import { Toaster } from 'react-hot-toast'
import { DownloadSimple, Eye, Link } from 'phosphor-react'
import Image from 'next/image'

import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { Button } from '../../components/elements/Button'
import { useGetIntegrationsQuery } from '../../lib/networking/queries/useGetIntegrationsQuery'
import { useGetWebhooksQuery } from '../../lib/networking/queries/useGetWebhooksQuery'
import { deleteIntegrationMutation } from '../../lib/networking/mutations/deleteIntegrationMutation'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { fetchEndpoint } from '../../lib/appConfig'
import { setIntegrationMutation } from '../../lib/networking/mutations/setIntegrationMutation'
import { cookieValue } from '../../lib/cookieHelpers'
import { importFromIntegrationMutation } from '../../lib/networking/mutations/importFromIntegrationMutation'

// Styles
const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '10px',
})

const Subheader = styled(Box, {
  padding: '20px',
  color: '$utilityTextDefault',
  borderBottom: '1px solid $grayLine',
  margin: '0 auto',
  width: '80%',
  // Our defined media queries don't work in styled components
  '@media (max-width: 575px)': {
    width: '100%',
  },
})

//interface
interface Integrations {
  id: string
}

type integrationsCard = {
  icon: string
  title: string
  subText?: string
  button: {
    text: string
    icon?: JSX.Element
    style: string
    action: () => void
  }
}
export default function Integrations(): JSX.Element {
  applyStoredTheme(false)
  const { integrations, revalidate } = useGetIntegrationsQuery()
  const { webhooks } = useGetWebhooksQuery()

  const [integrationsArray, setIntegrationsArray] = useState(
    Array<integrationsCard>()
  )
  const router = useRouter()

  const readwiseConnected = useMemo(() => {
    return integrations.find((i) => i.name == 'READWISE' && i.type == 'EXPORT')
  }, [integrations])
  const pocketConnected = useMemo(() => {
    return integrations.find((i) => i.name == 'POCKET' && i.type == 'IMPORT')
  }, [integrations])

  const deleteIntegration = async (id: string) => {
    try {
      await deleteIntegrationMutation(id)
      revalidate()
      showSuccessToast('Integration Removed')
    } catch (err) {
      showErrorToast('Error: ' + err)
    }
  }

  const importFromIntegration = async (id: string) => {
    try {
      await importFromIntegrationMutation(id)
      showSuccessToast('Import started')
    } catch (err) {
      showErrorToast('Error: ' + err)
    }
  }

  const redirectToPocket = () => {
    // create a form and submit it to the backend
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `${fetchEndpoint}/integration/pocket/auth`
    document.body.appendChild(form)
    form.submit()
  }

  useEffect(() => {
    const connectToPocket = async () => {
      try {
        // get the token from cookies
        const token = cookieValue('pocketRequestToken', document.cookie)
        if (!token) {
          showErrorToast('There was an error connecting to Pocket.')
          return
        }
        const result = await setIntegrationMutation({
          token,
          name: 'POCKET',
          type: 'IMPORT',
          enabled: true,
        })
        if (result) {
          revalidate()
          showSuccessToast('Connected with Pocket.')
        } else {
          showErrorToast('There was an error connecting to Pocket.')
        }
      } catch (err) {
        showErrorToast('Error: ' + err)
      }
    }
    if (!router.isReady) return
    if (
      router.query.state == 'pocketAuthorizationFinished' &&
      !pocketConnected
    ) {
      connectToPocket()
    }
  }, [router])

  useEffect(() => {
    setIntegrationsArray([
      {
        icon: '/static/icons/logseq.svg',
        title: 'Logseq',
        subText:
          'Logseq is an open-source knowledge base. Use the Omnivore Logseq plugin to sync articles, highlights, and notes to Logseq.',
        button: {
          text: `Install Logseq Plugin`,
          icon: <DownloadSimple size={16} weight={'bold'} />,
          style: 'ctaDarkYellow',
          action: () => {
            router.push(`https://github.com/omnivore-app/logseq-omnivore`)
          },
        },
      },
      {
        icon: '/static/icons/readwise.svg',
        title: 'Readwise',
        subText:
          'Readwise makes it easy to revisit and learn from your ebook & article highlights. Use our Readwise integration to sync your highlights from Omnivore to Readwise.',
        button: {
          text: readwiseConnected ? 'Remove' : 'Connect to Readwise',
          icon: <Link size={16} weight={'bold'} />,
          style: readwiseConnected ? 'ctaWhite' : 'ctaDarkYellow',
          action: () => {
            readwiseConnected
              ? deleteIntegration(readwiseConnected.id)
              : router.push('/settings/integrations/readwise')
          },
        },
      },
      {
        icon: '/static/icons/webhooks.svg',
        title: 'Webhooks',
        subText: `${webhooks.length} Webhooks`,
        button: {
          text: 'View Webhooks',
          icon: <Eye size={16} weight={'bold'} />,
          style: 'ctaWhite',
          action: () => router.push('/settings/webhooks'),
        },
      },
      {
        icon: '/static/icons/pocket.svg',
        title: 'Pocket',
        subText: 'Pocket is a place to save articles, videos, and more.',
        button: {
          text: pocketConnected ? 'Import' : 'Connect to Pocket',
          icon: <Link size={16} weight={'bold'} />,
          style: 'ctaDarkYellow',
          action: () => {
            pocketConnected
              ? importFromIntegration(pocketConnected.id)
              : redirectToPocket()
          },
        },
      },
    ])
  }, [pocketConnected, readwiseConnected, webhooks])

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <Header css={{ textAlign: 'center', width: '100%' }}>Integrations</Header>
      <Subheader>
        Connect with other applications can help enhance and streamline your
        experience with Omnivore, below are some useful apps to connect your
        Omnivore account to.
      </Subheader>
      <VStack
        distribution={'start'}
        css={{
          width: '80%',
          margin: '0 auto',
          height: '800px',
          '@smDown': {
            width: '100%',
          },
        }}
      >
        <Header>Applications</Header>

        {integrationsArray.map((item) => {
          return (
            <HStack
              key={item.title}
              css={{
                width: '100%',
                borderRadius: '5px',
                backgroundColor: '$grayBg',
                margin: '10px 0',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                '@smDown': {
                  flexWrap: 'wrap',
                  borderRadius: 'unset',
                },
              }}
            >
              <Image
                src={item.icon}
                alt="integration Image"
                width={75}
                height={75}
              />
              <Box
                css={{
                  '@sm': {
                    width: '60%',
                  },
                  padding: '8px',
                  color: '$utilityTextDefault',
                  m: '10px',
                  'h3, p': {
                    margin: '0',
                  },
                }}
              >
                <h3>{item.title}</h3>
                <p>{item.subText}</p>
              </Box>
              <HStack css={{ '@smDown': { width: '100%' } }}>
                <Button
                  style={
                    item.button.style === 'ctaDarkYellow'
                      ? 'ctaDarkYellow'
                      : 'ctaWhite'
                  }
                  css={{
                    py: '10px',
                    px: '14px',
                    minWidth: '230px',
                    width: '100%',
                  }}
                  onClick={item.button.action}
                >
                  {item.button.icon}
                  <SpanBox
                    css={{ pl: '10px', fontWeight: '600', fontSize: '16px' }}
                  >
                    {item.button.text}
                  </SpanBox>
                </Button>
              </HStack>
            </HStack>
          )
        })}
      </VStack>
    </SettingsLayout>
  )
}
