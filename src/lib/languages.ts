/**
 * Languages Dolmo can both hear and speak, in order of international importance (English first).
 * The first `INITIAL_LANGUAGE_COUNT` show in the language grid by default; the rest load on demand.
 *
 * These are the 91 languages of ElevenLabs Eleven v4 Turbo (`TTS_MODEL`) minus Kamba and Sorani
 * Kurdish, which Scribe v2 does not list. Scribe v2 Realtime detects the spoken language itself.
 */
export const SUPPORTED_LANGUAGES = [
	'en',
	'zh',
	'es',
	'fr',
	'ar',
	'ru',
	'pt',
	'de',
	'ja',
	'hi',
	'it',
	'ko',
	'tr',
	'id',
	'vi',
	'nl',
	'pl',
	'uk',
	'fa',
	'sw',
	'bn',
	'ur',
	'th',
	'he',
	'el',
	'sv',
	'af',
	'ms',
	'fil',
	'ta',
	'ro',
	'cs',
	'hu',
	'fi',
	'da',
	'no',
	'yue',
	'ha',
	'am',
	'zu',
	'te',
	'mr',
	'pa',
	'gu',
	'kn',
	'ml',
	'ne',
	'bg',
	'hr',
	'sr',
	'sk',
	'lt',
	'lv',
	'et',
	'sl',
	'ka',
	'hy',
	'az',
	'kk',
	'uz',
	'mn',
	'is',
	'mk',
	'bs',
	'be',
	'ca',
	'gl',
	'ast',
	'oc',
	'lb',
	'mt',
	'cy',
	'ps',
	'sd',
	'or',
	'as',
	'ceb',
	'jv',
	'my',
	'lo',
	'ky',
	'tg',
	'mi',
	'ln',
	'lg',
	'sn',
	'wo',
	'ff',
	'so'
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });

export function languageName(code: string): string {
	return displayNames.of(code) ?? code;
}

export function isSupportedLanguage(code: string): code is LanguageCode {
	return (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}
