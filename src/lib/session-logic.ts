import type { SpeechItem } from '#lib/audio/player.ts';
import type { TurnDecision, TurnRecord } from '#lib/turn.ts';

/** A conversation turn as these rules need it. Error turns have no outputs. */
export type LoggedTurn = TurnRecord | { id: string; kind: 'error' };

/** Key that identifies one spoken output, used for audio caching and playback highlighting. */
export function audioKey(turnId: string, language: string): string {
	return `${turnId}:${language}`;
}

/** Drops noise that Scribe commits as punctuation or symbols only. */
export function isSpeechText(text: string): boolean {
	return /[\p{L}\p{N}]/u.test(text);
}

/** The finished turns sent to Claude as history: the last `max`, without error turns or timing. */
export function buildHistory(turns: readonly LoggedTurn[], max: number): TurnRecord[] {
	return turns
		.filter((turn): turn is TurnRecord => turn.kind !== 'error')
		.slice(-max)
		.map(({ id, kind, sourceLanguage, original, outputs, repeatTurnId }) => ({
			id,
			kind,
			sourceLanguage,
			original,
			outputs,
			repeatTurnId
		}));
}

/** The speech for a decision. Only translations and clarifications are spoken. */
export function speechItemsFor(turnId: string, decision: TurnDecision): SpeechItem[] {
	if (decision.kind !== 'translate' && decision.kind !== 'clarify') return [];
	return decision.outputs.map((output) => ({
		key: audioKey(turnId, output.language),
		text: output.text,
		language: output.language
	}));
}

/** The text of one earlier output, or undefined when the turn or language is missing. */
export function findOutput(
	turns: readonly LoggedTurn[],
	turnId: string,
	language: string
): { language: string; text: string } | undefined {
	const turn = turns.find((candidate) => candidate.id === turnId);
	if (!turn || turn.kind === 'error') return undefined;
	return turn.outputs.find((output) => output.language === language);
}

/** Polls `condition` every `pollMs` until it is false or `maxMs` has passed. */
export async function waitWhile(
	condition: () => boolean,
	{ maxMs, pollMs }: { maxMs: number; pollMs: number }
): Promise<void> {
	const deadline = Date.now() + maxMs;
	while (condition() && Date.now() < deadline) {
		await new Promise((done) => setTimeout(done, pollMs));
	}
}
