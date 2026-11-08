import { isSupportedLanguage, type LanguageCode } from '#lib/languages.ts';

const STORAGE_KEY = 'dolmo.pinnedLanguages';

/**
 * Languages pinned to the top of the language grid on this device, plus whether the grid is in
 * pin mode. The setup screen and the grid share one instance.
 */
export class LanguagePins {
	static readonly MAX = 24;

	codes = $state<LanguageCode[]>([]);
	/** Pin mode: tapping a tile pins it instead of selecting it. */
	editing = $state(false);

	get full(): boolean {
		return this.codes.length >= LanguagePins.MAX;
	}

	has(code: LanguageCode): boolean {
		return this.codes.includes(code);
	}

	/** Reads the saved pins. Call once in the browser. */
	load(): void {
		try {
			const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
			if (!Array.isArray(stored)) return;
			this.codes = stored
				.filter(
					(code): code is LanguageCode => typeof code === 'string' && isSupportedLanguage(code)
				)
				.slice(0, LanguagePins.MAX);
		} catch {
			// Storage is unavailable or holds something unreadable: start without pins.
		}
	}

	/** Pins an unpinned language, or unpins a pinned one. Pinning past the limit does nothing. */
	toggle(code: LanguageCode): void {
		if (this.has(code)) {
			this.codes = this.codes.filter((language) => language !== code);
		} else if (!this.full) {
			this.codes = [...this.codes, code];
		} else {
			return;
		}
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.codes));
		} catch {
			// Storage is unavailable: the pin still applies for this visit.
		}
	}
}
