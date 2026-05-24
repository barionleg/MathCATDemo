import textToSpeech from '@google-cloud/text-to-speech';
import { googleMarksFromTimepoints } from '../lib/marks.js';
import { langToLocale } from '../lib/ssml.js';

let client;

function getClient() {
  if (client) {
    return client;
  }
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not configured');
  }
  client = new textToSpeech.TextToSpeechClient({
    credentials: JSON.parse(json),
  });
  return client;
}

export async function synthesize({ ssml, voice, lang }) {
  const tts = getClient();
  const [response] = await tts.synthesizeSpeech({
    input: { ssml },
    voice: {
      languageCode: langToLocale(lang),
      name: voice,
    },
    audioConfig: {
      audioEncoding: 'MP3',
    },
    enableTimePointing: ['SSML_MARK'],
  });

  if (!response.audioContent) {
    throw new Error('Google TTS returned no audio');
  }

  return {
    marks: googleMarksFromTimepoints(response.timepoints),
    audioBase64: Buffer.from(response.audioContent).toString('base64'),
    mimeType: 'audio/mpeg',
  };
}
