import type { RealtimeConnection } from '@elevenlabs/client';
import { SpeechPlayer, type SpeechItem } from '#lib/audio/player.ts';
import { languageName, type LanguageCode } from '#lib/languages.ts';
import { DEFAULT_EFFORT, DEFAULT_MODEL, type Effort, type ModelId } from '#lib/models.ts';
import { MAX_HISTORY_TURNS, type TurnDecision, type TurnRecord } from '#lib/turn.ts';
import { decideTurn, transcriptionToken } from '#lib/translate.remote.ts';

/**
 * Seconds of silence after which Scribe closes a speech segment. Long enough that a pause inside
 * a sentence does not end the utterance; higher values add latency after each turn.
 */
const VAD_SILENCE_SECONDS = 1.5;
/** Shortest speech Scribe commits; anything briefer is treated as a click or cough. */
const MIN_SPEECH_MS = 300;
/** Keep the microphone muted this long after playback so the tail of Dolmo's voice is not heard. */
const MIC_TAIL_MS = 300;
/** Longest Dolmo waits for the speaker to finish before it starts talking anyway. */
const MAX_YIELD_WAIT_MS = 5000;
/** How often Dolmo checks whether the speaker is still talking while it waits. */
const YIELD_POLL_MS = 100;
/** A connection that drops sooner than this after opening is not reopened automatically. */
const MIN_RECONNECT_INTERVAL_MS = 10_000;

export type SessionStatus = 'idle' | 'starting' | 'listening' | 'thinking' | 'speaking';

type TurnMeta = { durationMs: number; model: ModelId; effort: Effort };

export type SessionTurn =
	| (TurnRecord & TurnMeta)
	| ({ id: string; kind: 'error'; original: string; message: string } & TurnMeta);

type Job =
	{ type: 'utterance'; text: string } | { type: 'replay'; turnId: string; language: string };

export function audioKey(turnId: string, language: string): string {
	return `${turnId}:${language}`;
}

function errorMessage(error: unknown, fallback: string): string {
	if (error && typeof error === 'object') {
		const body = 'body' in error ? (error.body as { message?: unknown } | undefined) : undefined;
		if (typeof body?.message === 'string') return body.message;
		if ('error' in error && typeof error.error === 'string') return error.error;
		if (error instanceof Error && error.message) return error.message;
	}
	return fallback;
}

function wait(ms: number): Promise<void> {
	return new Promise((done) => setTimeout(done, ms));
}

/** Drops noise that Scribe commits as punctuation or symbols only. */
function isSpeechText(text: string): boolean {
	return /[\p{L}\p{N}]/u.test(text);
}

/**
 * One translation session on a shared device: listens through Scribe, asks Claude what each
 * utterance is, speaks the result, and keeps the conversation log. Half-duplex: the
 * microphone is muted while Dolmo speaks, so Dolmo never transcribes itself.
 */
export class TranslationSession {
	status = $state<SessionStatus>('idle');
	partial = $state('');
	turns = $state<SessionTurn[]>([]);
	languages = $state<LanguageCode[]>([]);
	model = $state<ModelId>(DEFAULT_MODEL);
	effort = $state<Effort>(DEFAULT_EFFORT);
	/** `audioKey` of the output being spoken right now. */
	speakingKey = $state<string | null>(null);
	/** Why the last start attempt failed, shown next to the Start button. */
	startError = $state<string | null>(null);

	#onError: (message: string) => void;
	#player: SpeechPlayer | null = null;
	#connection: RealtimeConnection | null = null;
	#connectedAt = 0;
	#active = false;
	/** True from the start of playback until the mic tail has passed; transcripts are ignored. */
	#muted = false;
	#queue: Job[] = [];
	#draining = false;
	#turnCount = 0;

	constructor(onError: (message: string) => void) {
		this.#onError = onError;
	}

	get running(): boolean {
		return this.status !== 'idle';
	}

	/** Starts listening. Must be called from a user gesture so audio playback is allowed. */
	async start(): Promise<void> {
		if (this.running || this.languages.length < 2) return;
		this.status = 'starting';
		this.startError = null;
		this.#player ??= new SpeechPlayer();
		// Every Start is a new conversation: nothing from the previous one is kept.
		this.#player.clear();
		this.turns = [];
		this.partial = '';
		this.speakingKey = null;
		this.#queue = [];
		this.#turnCount = 0;
		this.#muted = false;
		await this.#player.resume();

		try {
			// Ask for the microphone first so a denied permission gets a clear message.
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			for (const track of stream.getTracks()) track.stop();
		} catch {
			this.status = 'idle';
			this.startError = 'Dolmo needs microphone access. Allow it in your browser and try again.';
			return;
		}

		this.#active = true;
		try {
			await this.#connect();
		} catch (error) {
			this.#active = false;
			this.status = 'idle';
			this.startError = errorMessage(error, 'Could not start listening.');
		}
	}

	/** Stops listening. The conversation stays on screen and can still be replayed. */
	stop(): void {
		this.#active = false;
		this.#queue = [];
		this.#player?.stop();
		const connection = this.#connection;
		this.#connection = null;
		connection?.close();
		this.partial = '';
		this.#muted = false;
		if (!this.#draining) this.status = 'idle';
	}

	/** Skips whatever Dolmo is saying right now. */
	skip(): void {
		this.#player?.stop();
	}

	/** Speaks one earlier output again. */
	replay(turnId: string, language: string): void {
		this.#enqueue({ type: 'replay', turnId, language });
	}

	async #connect(): Promise<void> {
		// Loaded on demand: the SDK is browser-only and must not run during server rendering.
		const [{ CommitStrategy, RealtimeEvents, Scribe }, token] = await Promise.all([
			import('@elevenlabs/client'),
			transcriptionToken()
		]);
		// No pinned languageCode: Scribe picks among exactly the session languages.
		// vadThreshold is deliberately unset, because filterBackgroundAudio applies its own
		// lower threshold only when none is given.
		const connection = Scribe.connect({
			token,
			modelId: 'scribe_v2_realtime',
			commitStrategy: CommitStrategy.VAD,
			vadSilenceThresholdSecs: VAD_SILENCE_SECONDS,
			minSpeechDurationMs: MIN_SPEECH_MS,
			filterBackgroundAudio: true,
			secondaryLanguages: [...this.languages],
			includeLanguageDetection: true,
			keyterms: ['Dolmo'],
			noVerbatim: true,
			microphone: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true,
				channelCount: 1
			}
		});
		this.#connection = connection;
		this.#connectedAt = Date.now();
		if (this.#muted) this.#setMuted(connection, true);

		connection.on(RealtimeEvents.SESSION_STARTED, () => {
			if (this.status === 'starting') this.status = 'listening';
		});
		connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data) => {
			if (this.#connection === connection && !this.#muted) this.partial = data.text;
		});
		connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
			if (this.#connection !== connection || this.#muted) return;
			this.partial = '';
			const text = data.text.trim();
			if (isSpeechText(text)) this.#enqueue({ type: 'utterance', text });
		});
		// TEMPORARY debug: confirm which language Scribe detects. Remove once verified.
		connection.on(RealtimeEvents.FINAL_TRANSCRIPT_WITH_TIMESTAMPS, (data) => {
			console.debug('[scribe] detected language:', data.language_code, data.text);
		});
		connection.on(RealtimeEvents.ERROR, (error) => {
			if (this.#connection !== connection) return;
			const message = errorMessage(error, 'Speech recognition failed.');
			if (this.status === 'starting') {
				this.startError = message;
				this.stop();
			} else {
				this.#onError(message);
			}
		});
		connection.on(RealtimeEvents.CLOSE, () => {
			if (this.#connection !== connection || !this.#active) return;
			this.#connection = null;
			void this.#reconnect();
		});
	}

	async #reconnect(): Promise<void> {
		if (Date.now() - this.#connectedAt < MIN_RECONNECT_INTERVAL_MS) {
			this.#onError('Lost the connection to speech recognition. Press Start to try again.');
			this.stop();
			return;
		}
		try {
			await this.#connect();
		} catch (error) {
			this.#onError(errorMessage(error, 'Could not reconnect to speech recognition.'));
			this.stop();
		}
	}

	#enqueue(job: Job): void {
		this.#queue.push(job);
		void this.#drain();
	}

	async #drain(): Promise<void> {
		if (this.#draining) return;
		this.#draining = true;
		try {
			let job: Job | undefined;
			while ((job = this.#queue.shift())) {
				if (job.type === 'utterance') await this.#handleUtterance(job.text);
				else await this.#handleReplay(job.turnId, job.language);
			}
		} finally {
			this.#draining = false;
			this.status = this.#active ? 'listening' : 'idle';
		}
	}

	#history(): TurnRecord[] {
		return $state
			.snapshot(this.turns)
			.filter((turn): turn is TurnRecord & TurnMeta => turn.kind !== 'error')
			.slice(-MAX_HISTORY_TURNS)
			.map(({ id, kind, sourceLanguage, original, outputs, repeatTurnId }) => ({
				id,
				kind,
				sourceLanguage,
				original,
				outputs,
				repeatTurnId
			}));
	}

	async #handleUtterance(utterance: string): Promise<void> {
		this.status = 'thinking';
		const id = `t${++this.#turnCount}`;
		const meta = { model: this.model, effort: this.effort };
		const started = performance.now();

		let decision: TurnDecision;
		try {
			const result = await decideTurn({
				languages: [...this.languages],
				...meta,
				utterance,
				history: this.#history()
			});
			if (!result.ok) throw new Error(result.message);
			decision = result.decision;
		} catch (error) {
			const message = errorMessage(error, 'Dolmo could not process that. Please say it again.');
			const durationMs = Math.round(performance.now() - started);
			this.turns.push({ id, kind: 'error', original: utterance, message, durationMs, ...meta });
			this.#onError(message);
			return;
		}

		const durationMs = Math.round(performance.now() - started);
		this.turns.push({ id, original: utterance, ...decision, durationMs, ...meta });
		if (!this.#active) return;

		if (decision.kind === 'translate' || decision.kind === 'clarify') {
			await this.#speak(
				decision.outputs.map((output) => ({
					key: audioKey(id, output.language),
					text: output.text,
					language: output.language
				}))
			);
		} else if (decision.kind === 'repeat' && decision.repeatTurnId) {
			await this.#handleReplay(decision.repeatTurnId, decision.sourceLanguage);
		}
	}

	async #handleReplay(turnId: string, language: string): Promise<void> {
		const turn = this.turns.find((candidate) => candidate.id === turnId);
		const output =
			turn && turn.kind !== 'error'
				? turn.outputs.find((candidate) => candidate.language === language)
				: undefined;
		if (!output) return;
		await this.#speak([{ key: audioKey(turnId, language), text: output.text, language }]);
	}

	async #speak(items: SpeechItem[]): Promise<void> {
		if (!this.#player || items.length === 0) return;
		await this.#yieldToSpeaker();
		const connection = this.#connection;
		this.status = 'speaking';
		this.partial = '';
		this.#muted = true;
		this.#setMuted(connection, true);
		try {
			await this.#player.play(
				items,
				(key) => (this.speakingKey = key),
				(item, error) =>
					this.#onError(
						errorMessage(error, `Could not play the ${languageName(item.language)} audio.`)
					)
			);
			await wait(MIC_TAIL_MS);
		} finally {
			this.#muted = false;
			this.#setMuted(connection, false);
		}
	}

	/** Waits while the speaker is still mid-sentence, so Dolmo does not talk over them. */
	async #yieldToSpeaker(): Promise<void> {
		const deadline = Date.now() + MAX_YIELD_WAIT_MS;
		while (this.partial && Date.now() < deadline) await wait(YIELD_POLL_MS);
	}

	#setMuted(connection: RealtimeConnection | null, muted: boolean): void {
		if (!connection || connection !== this.#connection) return;
		try {
			if (muted) connection.mute();
			else connection.unmute();
		} catch {
			// The microphone track is not live yet; there is nothing to mute.
		}
	}
}
