import { error } from '@sveltejs/kit';
import { ElevenLabsClient, ElevenLabsError } from '@elevenlabs/elevenlabs-js';
import { ELEVENLABS_API_KEY } from '$app/env/private';

export const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

/** "George", a premade multilingual voice available to every ElevenLabs account. */
export const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

/** Lowest-latency multilingual TTS model; its 32 languages define `SUPPORTED_LANGUAGES`. */
export const TTS_MODEL = 'eleven_flash_v2_5';

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
