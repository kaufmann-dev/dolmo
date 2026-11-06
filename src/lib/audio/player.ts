import { resolve } from '$app/paths';

export type SpeechItem = { key: string; text: string; language: string };

async function synthesize(text: string, language: string): Promise<ArrayBuffer> {
	const response = await fetch(resolve('/api/speech'), {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ text, language })
	});
	if (!response.ok) {
		const body: { message?: string } | null = await response.json().catch(() => null);
		throw new Error(body?.message ?? `Speech request failed (${response.status}).`);
	}
	return response.arrayBuffer();
}

/**
 * Plays synthesized speech through one AudioContext. Create it from a click handler so the
 * browser allows playback. Decoded audio is kept per key, so a repeat replays the exact
 * audio heard before without another TTS request.
 */
export class SpeechPlayer {
	#context = new AudioContext();
	#buffers = new Map<string, Promise<AudioBuffer>>();
	#source: AudioBufferSourceNode | null = null;
	#cancelled = false;

	resume(): Promise<void> {
		return this.#context.resume();
	}

	#load(item: SpeechItem): Promise<AudioBuffer> {
		let buffer = this.#buffers.get(item.key);
		if (!buffer) {
			buffer = synthesize(item.text, item.language).then((data) =>
				this.#context.decodeAudioData(data)
			);
			// Forget failures so a later replay can try again.
			buffer.catch(() => this.#buffers.delete(item.key));
			this.#buffers.set(item.key, buffer);
		}
		return buffer;
	}

	/**
	 * Fetches every item in parallel and plays them one after another. Resolves when playback
	 * finishes or `stop()` is called. Items that fail to load are reported and skipped.
	 */
	async play(
		items: SpeechItem[],
		onPlaying: (key: string | null) => void,
		onError: (item: SpeechItem, error: unknown) => void
	): Promise<void> {
		this.#cancelled = false;
		const buffers = items.map((item) => this.#load(item));
		for (const [index, item] of items.entries()) {
			let buffer: AudioBuffer;
			try {
				buffer = await buffers[index];
			} catch (error) {
				onError(item, error);
				continue;
			}
			if (this.#cancelled) break;
			onPlaying(item.key);
			await this.#playBuffer(buffer);
			if (this.#cancelled) break;
		}
		onPlaying(null);
	}

	#playBuffer(buffer: AudioBuffer): Promise<void> {
		return new Promise((done) => {
			const source = this.#context.createBufferSource();
			source.buffer = buffer;
			source.connect(this.#context.destination);
			source.onended = () => {
				this.#source = null;
				done();
			};
			this.#source = source;
			source.start();
		});
	}

	/** Stops the current playback sequence. */
	stop(): void {
		this.#cancelled = true;
		this.#source?.stop();
	}
}
