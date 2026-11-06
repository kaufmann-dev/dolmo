import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from '#lib/languages.ts';
import { elevenlabs, elevenLabsFailure, TTS_MODEL, VOICE_ID } from '#lib/server/elevenlabs.ts';
import { MAX_UTTERANCE_LENGTH } from '#lib/turn.ts';
import type { RequestHandler } from './$types';

const SpeechRequest = z.object({
	text: z
		.string()
		.trim()
		.min(1)
		.max(MAX_UTTERANCE_LENGTH * 2),
	language: z.enum(SUPPORTED_LANGUAGES)
});

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Sign in to use Dolmo.');

	const parsed = SpeechRequest.safeParse(await request.json().catch(() => null));
	if (!parsed.success) error(400, 'Invalid speech request.');

	let audio: ReadableStream<Uint8Array>;
	try {
		audio = await elevenlabs.textToSpeech.stream(VOICE_ID, {
			text: parsed.data.text,
			modelId: TTS_MODEL,
			languageCode: parsed.data.language,
			outputFormat: 'mp3_44100_128'
		});
	} catch (cause) {
		elevenLabsFailure(cause, 'speech synthesis');
	}

	return new Response(audio, {
		headers: { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' }
	});
};
