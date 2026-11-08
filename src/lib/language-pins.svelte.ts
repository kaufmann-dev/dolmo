import { MAX_PINNED_LANGUAGES, type LanguageCode } from '#lib/languages.ts';

/**
 * Languages the user pinned to the top of the language grid, plus whether the grid is in pin
 * mode. The setup screen and the grid share one instance. Changes show at once and are saved to
 * the account in the background, one save after another, each sending the list as it is then.
 */
export class LanguagePins {
	codes = $state<LanguageCode[]>([]);
	/** Pin mode: tapping a tile pins it instead of selecting it. */
	editing = $state(false);

	readonly #save: (codes: LanguageCode[]) => Promise<unknown>;
	readonly #onError: (message: string) => void;
	#saving: Promise<void> = Promise.resolve();

	constructor(
		initial: readonly LanguageCode[],
		save: (codes: LanguageCode[]) => Promise<unknown>,
		onError: (message: string) => void
	) {
		this.codes = initial.slice(0, MAX_PINNED_LANGUAGES);
		this.#save = save;
		this.#onError = onError;
	}

	get full(): boolean {
		return this.codes.length >= MAX_PINNED_LANGUAGES;
	}

	has(code: LanguageCode): boolean {
		return this.codes.includes(code);
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
		this.#saving = this.#saving
			.then(() => this.#save([...this.codes]))
			.then(
				() => undefined,
				() => this.#onError('Could not save your pinned languages. Try again.')
			);
	}
}
