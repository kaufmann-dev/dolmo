import { command } from '$app/server';
import { decideTurn as decide } from '#lib/server/anthropic.ts';
import { elevenlabs, elevenLabsFailure } from '#lib/server/elevenlabs.ts';
import { requireUser } from '#lib/server/session.ts';
import { DecideTurnInput } from '#lib/turn.ts';

/** Single-use token that lets the browser open one Scribe realtime connection. */
export const transcriptionToken = command(async () => {
	requireUser();
	try {
		const { token } = await elevenlabs.tokens.singleUse.create('realtime_scribe');
		return token;
	} catch (cause) {
		elevenLabsFailure(cause, 'transcription token');
	}
});

/** Classifies one committed utterance and translates it when it is meant for the others. */
export const decideTurn = command(DecideTurnInput, async (input) => {
	requireUser();
	return decide(input);
});
