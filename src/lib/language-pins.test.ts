import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguagePins } from '#lib/language-pins.svelte.ts';
import { SUPPORTED_LANGUAGES } from '#lib/languages.ts';

const KEY = 'dolmo.pinnedLanguages';

let store: Map<string, string>;

beforeEach(() => {
	store = new Map();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => void store.set(key, value)
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('LanguagePins', () => {
	it('pins and unpins a language and saves the result', () => {
		const pins = new LanguagePins();

		pins.toggle('uk');
		expect(pins.has('uk')).toBe(true);
		expect(store.get(KEY)).toBe('["uk"]');

		pins.toggle('uk');
		expect(pins.has('uk')).toBe(false);
		expect(store.get(KEY)).toBe('[]');
	});

	it('refuses to pin more than the maximum but still unpins', () => {
		const pins = new LanguagePins();
		const first = SUPPORTED_LANGUAGES.slice(0, LanguagePins.MAX);
		for (const code of first) pins.toggle(code);

		expect(pins.full).toBe(true);
		pins.toggle(SUPPORTED_LANGUAGES[LanguagePins.MAX]);
		expect(pins.codes).toEqual(first);

		pins.toggle(first[0]);
		expect(pins.full).toBe(false);
		expect(pins.has(first[0])).toBe(false);
	});

	it('loads saved pins and drops unknown codes', () => {
		store.set(KEY, JSON.stringify(['de', 'xx', 42, 'uk']));
		const pins = new LanguagePins();
		pins.load();

		expect(pins.codes).toEqual(['de', 'uk']);
	});

	it('limits saved pins to the maximum', () => {
		store.set(KEY, JSON.stringify(SUPPORTED_LANGUAGES));
		const pins = new LanguagePins();
		pins.load();

		expect(pins.codes).toEqual(SUPPORTED_LANGUAGES.slice(0, LanguagePins.MAX));
	});

	it('starts without pins when the saved value is unreadable', () => {
		store.set(KEY, '{not json');
		const pins = new LanguagePins();
		pins.load();
		expect(pins.codes).toEqual([]);

		store.set(KEY, '"de"');
		pins.load();
		expect(pins.codes).toEqual([]);
	});

	it('keeps pins for the visit when storage is unavailable', () => {
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			}
		});
		const pins = new LanguagePins();
		pins.load();
		pins.toggle('de');

		expect(pins.codes).toEqual(['de']);
	});
});
