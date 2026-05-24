import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { pollyMarksFromJsonLines } from '../lib/marks.js';

const polly = new PollyClient({});

async function readStream(stream) {
  if (!stream) {
    return new Uint8Array();
  }
  if (typeof stream.transformToByteArray === 'function') {
    return stream.transformToByteArray();
  }
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

export async function synthesize({ ssml, voice }) {
  const params = {
    Text: ssml,
    TextType: 'ssml',
    VoiceId: voice,
    Engine: 'standard',
  };

  const marksResponse = await polly.send(
    new SynthesizeSpeechCommand({
      ...params,
      OutputFormat: 'json',
      SpeechMarkTypes: ['ssml'],
    })
  );
  const marksBytes = await readStream(marksResponse.AudioStream);
  const marksText = new TextDecoder('utf-8').decode(marksBytes);

  const audioResponse = await polly.send(
    new SynthesizeSpeechCommand({
      ...params,
      OutputFormat: 'mp3',
    })
  );
  const audioBytes = await readStream(audioResponse.AudioStream);

  return {
    marks: pollyMarksFromJsonLines(marksText),
    audioBase64: Buffer.from(audioBytes).toString('base64'),
    mimeType: 'audio/mpeg',
  };
}
