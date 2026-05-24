# MathCAT Demo TTS Proxy

Serverless proxy for speech playback. The GitHub Pages frontend posts MathCAT SSML plus a language code; the proxy selects the configured engine and returns normalized speech marks and MP3 audio.

Supported engines (set with `TTS_PROVIDER`):

| Provider | Env vars |
|----------|----------|
| `polly` (default) | Uses the Lambda execution role (`polly:SynthesizeSpeech`) |
| `google` | `GOOGLE_SERVICE_ACCOUNT_JSON` — full service-account JSON string |
| `azure` | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` |

MathCAT emits W3C-style `<mark name="id"/>` bookmarks. Azure requires `<bookmark mark="id"/>`; the proxy converts that automatically when `TTS_PROVIDER=azure`.

## API

```http
POST /tts
Content-Type: application/json

{ "text": "<prosody>...</prosody>", "lang": "en" }
```

Response:

```json
{
  "marks": [{ "time": 120, "value": "element-id" }],
  "audioBase64": "...",
  "mimeType": "audio/mpeg"
}
```

## Deploy

```bash
cd lambda/tts
npm install
sam build
sam deploy --guided
```

Set `TtsProvider` during deploy (or in `samconfig.toml`). For Google/Azure, also pass the credential parameters or add them in the AWS Lambda console after deploy.

Note the `TtsApiUrl` output and set it in `index.html`:

```html
window.MATHCAT_TTS_API = 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/tts';
```

## GitHub Actions

Workflow `.github/workflows/deploy-tts-lambda.yml` deploys when `lambda/tts/**` changes.

Repository secrets for deploy:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

Optional secrets for non-Polly engines:

- `TTS_PROVIDER`
- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`
- `GOOGLE_SERVICE_ACCOUNT_JSON`

## Security

- Credentials stay on the server; the browser only sees the proxy URL.
- Restrict `AllowedOrigins` to your demo site and local dev URLs.
- Enable billing alerts for whichever cloud TTS service you use.
