import { wrapSpeak } from '../lib/ssml.js';
import { voiceForLang } from '../lib/voices.js';
import * as polly from './polly.js';
import * as google from './google.js';
import * as azure from './azure.js';

const PROVIDERS = {
  polly,
  google,
  azure,
};

export function getProviderName() {
  const name = (process.env.TTS_PROVIDER || 'polly').toLowerCase();
  if (!PROVIDERS[name]) {
    throw new Error(`Unsupported TTS_PROVIDER: ${name}`);
  }
  return name;
}

export async function synthesizeSpeech({ text, lang }) {
  const providerName = getProviderName();
  const provider = PROVIDERS[providerName];
  const ssml = wrapSpeak(text, lang, providerName);
  const voice = voiceForLang(providerName, lang);
  return provider.synthesize({ ssml, voice, lang });
}
