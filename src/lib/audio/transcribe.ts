import { resolve } from '$app/paths';
import { clipFileName } from '#lib/audio/clip-recorder.ts';

/** Sends one recorded clip to the server, which transcribes it with Scribe v2 batch. */
export async function transcribeClip(clip: Blob): Promise<string> {
	const form = new FormData();
	form.append(
		'audio',
		new File([clip], clipFileName(clip.type), { type: clip.type || 'audio/webm' })
	);
	const response = await fetch(resolve('/api/transcribe'), { method: 'POST', body: form });
	if (!response.ok) {
		const body: { message?: string } | null = await response.json().catch(() => null);
		throw new Error(body?.message ?? `Transcription failed (${response.status}).`);
	}
	const body: { text: string } = await response.json();
	return body.text;
}
