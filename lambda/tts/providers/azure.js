import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { azureMarksFromEvents } from '../lib/marks.js';

function getSpeechConfig() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION must be configured');
  }
  return sdk.SpeechConfig.fromSubscription(key, region);
}

export async function synthesize({ ssml, voice }) {
  const speechConfig = getSpeechConfig();
  speechConfig.speechSynthesisVoiceName = voice;
  speechConfig.setSpeechSynthesisOutputFormat(
    sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
  );

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
  const bookmarkEvents = [];

  synthesizer.bookmarkReached = (_sender, event) => {
    bookmarkEvents.push({
      audioOffset: event.audioOffset,
      text: event.text,
    });
  };

  try {
    const result = await new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (speechResult) => {
          if (speechResult.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(speechResult);
            return;
          }
          const details = sdk.SpeechSynthesisCancellationDetails.fromResult(speechResult);
          reject(new Error(details.errorDetails || `Azure synthesis failed: ${speechResult.reason}`));
        },
        (error) => reject(error)
      );
    });

    return {
      marks: azureMarksFromEvents(bookmarkEvents),
      audioBase64: Buffer.from(result.audioData).toString('base64'),
      mimeType: 'audio/mpeg',
    };
  } finally {
    synthesizer.close();
  }
}
