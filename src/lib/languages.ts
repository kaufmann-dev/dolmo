/**
 * Languages Dolmo can both hear and speak: the 32 languages of ElevenLabs Eleven v4 Turbo
 * (Scribe v2 Realtime covers all of them).
 */
export const SUPPORTED_LANGUAGES = [
	'ar',
	'bg',
	'zh',
	'hr',
	'cs',
	'da',
	'nl',
	'en',
	'fil',
	'fi',
	'fr',
	'de',
	'el',
	'hu',
	'hi',
	'id',
	'it',
	'ja',
	'ko',
	'ms',
	'no',
	'pl',
	'pt',
	'ro',
	'ru',
	'sk',
	'es',
	'sv',
	'ta',
	'tr',
	'uk',
	'vi'
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });

export function languageName(code: string): string {
	return displayNames.of(code) ?? code;
}

export function isSupportedLanguage(code: string): code is LanguageCode {
	return (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}
