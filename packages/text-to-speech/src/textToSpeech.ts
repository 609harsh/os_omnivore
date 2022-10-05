import {
  CancellationDetails,
  CancellationReason,
  PropertyId,
  ResultReason,
  SpeechConfig,
  SpeechSynthesisBoundaryType,
  SpeechSynthesisOutputFormat,
  SpeechSynthesisResult,
  SpeechSynthesizer,
} from 'microsoft-cognitiveservices-speech-sdk'
import { endSsml, htmlToSsmlItems, ssmlItemText, startSsml } from './htmlToSsml'
import * as _ from 'underscore'

export interface TextToSpeechInput {
  text: string
  voice?: string
  language?: string
  textType?: 'html' | 'ssml'
  rate?: string
  secondaryVoice?: string
  audioStream?: NodeJS.ReadWriteStream
}

export interface TextToSpeechOutput {
  audioData?: Buffer
  speechMarks: SpeechMark[]
}

export interface SpeechMark {
  time: number
  start?: number
  length?: number
  word: string
  type: 'word' | 'bookmark' | 'punctuation' | 'sentence'
}

export const synthesizeTextToSpeech = async (
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> => {
  if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
    throw new Error('Azure Speech Key or Region not set')
  }
  const textType = input.textType || 'html'
  const audioStream = input.audioStream
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION
  )
  speechConfig.speechSynthesisOutputFormat =
    SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
  // Required for sentence-level WordBoundary events
  speechConfig.setProperty(
    PropertyId.SpeechServiceResponse_RequestSentenceBoundary,
    'true'
  )

  // Create the speech synthesizer.
  const synthesizer = new SpeechSynthesizer(speechConfig)
  const speechMarks: SpeechMark[] = []
  let timeOffset = 0
  // let wordOffset = 0

  synthesizer.synthesizing = function (s, e) {
    // convert arrayBuffer to stream and write to stream
    audioStream?.write(Buffer.from(e.result.audioData))
  }

  // The event synthesis completed signals that the synthesis is completed.
  synthesizer.synthesisCompleted = (s, e) => {
    console.info(
      `(synthesized) Reason: ${ResultReason[e.result.reason]} Audio length: ${
        e.result.audioData.byteLength
      }`
    )
  }

  // The synthesis started event signals that the synthesis is started.
  synthesizer.synthesisStarted = (s, e) => {
    console.info('(synthesis started)')
  }

  // The event signals that the service has stopped processing speech.
  // This can happen when an error is encountered.
  synthesizer.SynthesisCanceled = (s, e) => {
    const cancellationDetails = CancellationDetails.fromResult(e.result)
    let str =
      '(cancel) Reason: ' + CancellationReason[cancellationDetails.reason]
    if (cancellationDetails.reason === CancellationReason.Error) {
      str += ': ' + e.result.errorDetails
    }
    console.log(str)
  }

  // The unit of e.audioOffset is tick (1 tick = 100 nanoseconds), divide by 10,000 to convert to milliseconds.
  synthesizer.wordBoundary = (s, e) => {
    e.boundaryType === SpeechSynthesisBoundaryType.Sentence &&
      speechMarks.push({
        word: e.text,
        time: (timeOffset + e.audioOffset) / 10000,
        start: e.textOffset,
        length: e.text.length,
        type: 'sentence',
      })
  }

  synthesizer.bookmarkReached = (s, e) => {
    speechMarks.push({
      word: e.text,
      time: (timeOffset + e.audioOffset) / 10000,
      type: 'bookmark',
    })
  }

  const speakSsmlAsyncPromise = (
    ssml: string
  ): Promise<SpeechSynthesisResult> => {
    return new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          resolve(result)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  try {
    const ssmlOptions = {
      primaryVoice: input.voice,
      secondaryVoice: input.secondaryVoice,
      language: input.language,
      rate: input.rate,
    }
    if (textType === 'html') {
      const ssmlItems = htmlToSsmlItems(input.text, ssmlOptions)
      for (const ssmlItem of ssmlItems) {
        const ssml = ssmlItemText(ssmlItem)
        const result = await speakSsmlAsyncPromise(ssml)
        timeOffset = timeOffset + result.audioDuration
      }
      return {
        speechMarks,
      }
    }
    // for ssml
    const startSsmlTag = startSsml(ssmlOptions)
    const text = _.escape(input.text)
    const ssml = `${startSsmlTag}${text}${endSsml()}`
    // set the text offset to be the end of SSML start tag
    // wordOffset -= startSsmlTag.length
    const result = await speakSsmlAsyncPromise(ssml)
    if (result.reason === ResultReason.Canceled) {
      throw new Error(result.errorDetails)
    }

    return {
      audioData: Buffer.from(result.audioData),
      speechMarks,
    }
  } catch (error) {
    console.error('synthesis error:', error)
    throw error
  } finally {
    audioStream?.end()
    synthesizer.close()
    console.log('synthesizer closed')
  }
}
