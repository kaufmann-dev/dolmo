/** Longest clip recorded in one press; the press ends automatically at this length. */
const MAX_CLIP_MS = 30_000;
/** Presses shorter than this are treated as accidental taps and not sent. */
const MIN_CLIP_MS = 400;
/** Keeps recording briefly after release so the last syllable is not cut off. */
const TAIL_MS = 250;
const BITS_PER_SECOND = 32_000;

/** The first recording format the browser supports. Safari records MP4 instead of WebM. */
export function pickMimeType(isSupported: (type: string) => boolean): string | undefined {
	return ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(isSupported);
}

/** File name for an uploaded clip, matching its container. */
export function clipFileName(type: string): string {
	return type.startsWith('audio/mp4') ? 'clip.m4a' : 'clip.webm';
}

function setTracks(stream: MediaStream, enabled: boolean): void {
	for (const track of stream.getAudioTracks()) track.enabled = enabled;
}

/**
 * Records one short clip per press. The microphone is opened once at Start and its tracks are
 * disabled between presses, so a press begins recording at once. Browser only.
 */
export class ClipRecorder {
	/** Called when a press reaches the maximum length. */
	onLimit: (() => void) | null = null;

	readonly #stream: MediaStream;
	readonly #mimeType: string;
	#recorder: MediaRecorder | null = null;
	#chunks: Blob[] = [];
	#startedAt = 0;
	#limitTimer: ReturnType<typeof setTimeout> | undefined;

	private constructor(stream: MediaStream, mimeType: string) {
		this.#stream = stream;
		this.#mimeType = mimeType;
	}

	static async open(): Promise<ClipRecorder> {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true,
				channelCount: 1
			}
		});
		setTracks(stream, false);
		const mimeType = pickMimeType((type) => MediaRecorder.isTypeSupported(type)) ?? '';
		return new ClipRecorder(stream, mimeType);
	}

	start(): void {
		setTracks(this.#stream, true);
		this.#chunks = [];
		const recorder = new MediaRecorder(this.#stream, {
			mimeType: this.#mimeType || undefined,
			audioBitsPerSecond: BITS_PER_SECOND
		});
		recorder.ondataavailable = (event) => {
			if (event.data.size > 0) this.#chunks.push(event.data);
		};
		recorder.start();
		this.#recorder = recorder;
		this.#startedAt = performance.now();
		this.#limitTimer = setTimeout(() => this.onLimit?.(), MAX_CLIP_MS);
	}

	/** Ends the press and resolves the recorded clip, or null when the press was too short. */
	async stop(): Promise<Blob | null> {
		const recorder = this.#recorder;
		if (!recorder) return null;
		this.#recorder = null;
		const heldMs = performance.now() - this.#startedAt;
		await new Promise((done) => setTimeout(done, TAIL_MS));
		clearTimeout(this.#limitTimer);
		const stopped = new Promise<void>((done) => {
			recorder.onstop = () => done();
		});
		recorder.stop();
		await stopped;
		setTracks(this.#stream, false);
		if (heldMs < MIN_CLIP_MS) return null;
		return new Blob(this.#chunks, { type: recorder.mimeType || this.#mimeType });
	}

	/** Releases the microphone for good. */
	close(): void {
		clearTimeout(this.#limitTimer);
		if (this.#recorder) this.#recorder.stop();
		this.#recorder = null;
		for (const track of this.#stream.getTracks()) track.stop();
	}
}
