import { describe, expect, it, vi } from 'vitest';
import { LanguagePins } from '#lib/language-pins.svelte.ts';
import { MAX_PINNED_LANGUAGES, SUPPORTED_LANGUAGES, type LanguageCode } from '#lib/languages.ts';

function setup(initial: LanguageCode[] = []) {
	const save = vi.fn(() => Promise.resolve());
	const onError = vi.fn();
	return { pins: new LanguagePins(initial, save, onError), save, onError };
}

describe('LanguagePins', () => {
	it('pins and unpins a language and saves the whole list', async () => {
		const { pins, save } = setup();

		pins.toggle('uk');
		expect(pins.has('uk')).toBe(true);
		await vi.waitFor(() => expect(save).toHaveBeenLastCalledWith(['uk']));

		pins.toggle('uk');
		expect(pins.has('uk')).toBe(false);
		await vi.waitFor(() => expect(save).toHaveBeenLastCalledWith([]));
	});

	it('refuses to pin more than the maximum but still unpins', async () => {
		const first = SUPPORTED_LANGUAGES.slice(0, MAX_PINNED_LANGUAGES);
		const { pins, save } = setup([...first]);

		expect(pins.full).toBe(true);
		pins.toggle(SUPPORTED_LANGUAGES[MAX_PINNED_LANGUAGES]);
		expect(pins.codes).toEqual(first);
		expect(save).not.toHaveBeenCalled();

		pins.toggle(first[0]);
		expect(pins.full).toBe(false);
		await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
	});

	it('limits the initial pins to the maximum', () => {
		const { pins } = setup([...SUPPORTED_LANGUAGES]);

		expect(pins.codes).toEqual(SUPPORTED_LANGUAGES.slice(0, MAX_PINNED_LANGUAGES));
	});

	it('saves one change after another, each with the list as it is by then', async () => {
		const { pins, save } = setup();

		pins.toggle('de');
		pins.toggle('uk');
		await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(2));

		expect(save).toHaveBeenNthCalledWith(1, ['de', 'uk']);
		expect(save).toHaveBeenNthCalledWith(2, ['de', 'uk']);
	});

	it('reports a failed save, keeps the pin and saves again on the next change', async () => {
		const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
		const onError = vi.fn();
		const pins = new LanguagePins([], save, onError);

		pins.toggle('de');
		await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
		expect(pins.has('de')).toBe(true);

		pins.toggle('uk');
		await vi.waitFor(() => expect(save).toHaveBeenLastCalledWith(['de', 'uk']));
		expect(onError).toHaveBeenCalledTimes(1);
	});
});
