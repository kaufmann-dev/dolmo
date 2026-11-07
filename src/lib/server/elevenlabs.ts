import { error } from '@sveltejs/kit';
import { ElevenLabsClient, ElevenLabsError } from '@elevenlabs/elevenlabs-js';
import { ELEVENLABS_API_KEY } from '$app/env/private';

export const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

/** "George", a premade multilingual voice available to every ElevenLabs account. */
export const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

/** Multilingual TTS model; its languages must include every entry of `SUPPORTED_LANGUAGES`. */
export const TTS_MODEL = 'eleven_v4_turbo';

/** Batch transcription model for push-to-listen clips (the live model is set in the browser). */
export const TRANSCRIBE_MODEL = 'scribe_v2';

/** Logs an ElevenLabs failure and rejects the request with a 502 the browser can show. */
export function elevenLabsFailure(cause: unknown, action: string): never {
	if (cause instanceof ElevenLabsError) {
		console.error(
			`ElevenLabs ${action} failed (${cause.statusCode ?? 'no status'}):`,
			cause.message
		);
		const reason =
			cause.statusCode === 401
				? 'the API key was rejected'
				: `error ${cause.statusCode ?? 'unknown'}`;
		error(502, `ElevenLabs ${action} failed: ${reason}.`);
	}
	console.error(`ElevenLabs ${action} failed:`, cause);
	error(502, `ElevenLabs ${action} failed.`);
}
