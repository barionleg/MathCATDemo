import { synthesizeSpeech } from './providers/index.js';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://nsoiffer.github.io,http://localhost:8080,http://127.0.0.1:8080')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function resolveOrigin(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  return ALLOWED_ORIGINS[0];
}

function jsonResponse(statusCode, origin, body) {
  return {
    statusCode,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  const origin = resolveOrigin(event);
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(origin),
      body: '',
    };
  }

  if (method !== 'POST') {
    return jsonResponse(405, origin, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, origin, { error: 'Invalid JSON body' });
  }

  const { text, lang } = body;
  if (!text) {
    return jsonResponse(400, origin, { error: 'text is required' });
  }

  try {
    const result = await synthesizeSpeech({
      text,
      lang: lang || 'en',
    });
    return jsonResponse(200, origin, result);
  } catch (err) {
    console.error('TTS synthesis failed:', err);
    return jsonResponse(502, origin, { error: 'TTS synthesis failed' });
  }
};
