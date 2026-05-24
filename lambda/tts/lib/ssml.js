const LANG_TO_LOCALE = {
  da: 'da-DK',
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fi: 'fi-FI',
  fr: 'fr-FR',
  id: 'id-ID',
  is: 'is-IS',
  it: 'it-IT',
  nb: 'nb-NO',
  nl: 'nl-NL',
  pl: 'pl-PL',
  pt: 'pt-PT',
  sv: 'sv-SE',
  vi: 'vi-VN',
  'zh-cn': 'cmn-CN',
  'zh-tw': 'zh-TW',
};

export function langToLocale(lang) {
  return LANG_TO_LOCALE[lang?.toLowerCase()] || 'en-US';
}

export function stripSpeakWrapper(text) {
  const trimmed = text.trim();
  const match = trimmed.match(/^<speak[^>]*>([\s\S]*)<\/speak>$/i);
  return match ? match[1].trim() : trimmed;
}

export function enhanceSsml(text) {
  const capLetter = /(<say-as interpret-as='characters'>[A-Z]<\/say-as>)/g;
  return text.replace(capLetter, "<prosody pitch='+90%'>$1</prosody>");
}

export function ssmlMarksToAzureBookmarks(text) {
  return text.replace(/<mark\s+name=(['"])(.*?)\1\s*\/?>/gi, '<bookmark mark=$1$2$1/>');
}

export function wrapSpeak(innerSsml, lang, provider) {
  const locale = langToLocale(lang);
  const body = enhanceSsml(stripSpeakWrapper(innerSsml));
  if (provider === 'azure') {
    const azureBody = ssmlMarksToAzureBookmarks(body);
    return (
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" ` +
      `xml:lang="${locale}">${azureBody}</speak>`
    );
  }
  return `<speak>${body}</speak>`;
}
