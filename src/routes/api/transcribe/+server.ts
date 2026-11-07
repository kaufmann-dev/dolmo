import { error } from '@sveltejs/kit';
import { elevenlabs, elevenLabsFailure, TRANSCRIBE_MODEL } from '#lib/server/elevenlabs.ts';
import type { RequestHandler } from './$types';

/** Largest accepted clip. 30 seconds at 32 kbps is about 120 KB, so this leaves headroom. */
const MAX_CLIP_BYTES = 400 * 1024;

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Sign in to use Dolmo.');

	const form = await request.formData().catch(() => null);
	const audio = form?.get('audio');
	if (
		!(audio instanceof File) ||
		!audio.type.startsWith('audio/') ||
		audio.size === 0 ||
		audio.size > MAX_CLIP_BYTES
	) {
		error(400, 'Invalid audio clip.');
	}

	let result;
	try {
		result = await elevenlabs.speechToText.convert({
			modelId: TRANSCRIBE_MODEL,
			file: audio,
			tagAudioEvents: false,
			diarize: false,
			noVerbatim: true
		});
	} catch (cause) {
		elevenLabsFailure(cause, 'transcription');
	}

	// A single-channel clip returns the transcript text; other response shapes are not expected.
	if (!('text' in result)) error(502, 'ElevenLabs transcription returned an unexpected response.');
	return Response.json({ text: result.text.trim() });
};
