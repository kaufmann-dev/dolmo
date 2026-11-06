import { isSupportedLanguage } from '#lib/languages.ts';
import type { DecideTurnInput, TurnDecision } from '#lib/turn.ts';

export type ValidationResult = { ok: true; decision: TurnDecision } | { ok: false; reason: string };

/**
 * Checks Claude's decision against the session and normalizes it: outputs follow the
 * session's language order, text is trimmed, and fields a kind does not use are cleared.
 */
export function validateDecision(decision: TurnDecision, input: DecideTurnInput): ValidationResult {
	const sourceLanguage = decision.sourceLanguage.trim().toLowerCase();
	if (!/^[a-z]{2,3}$/.test(sourceLanguage)) {
		return { ok: false, reason: `invalid source language "${decision.sourceLanguage}"` };
	}

	const outputs = decision.outputs.map((output) => ({
		language: output.language.trim().toLowerCase(),
		text: output.text.trim()
	}));

	switch (decision.kind) {
		case 'translate': {
			const expected = input.languages.filter((language) => language !== sourceLanguage);
			const languages = outputs.map((output) => output.language);
			if (new Set(languages).size !== languages.length) {
				return { ok: false, reason: 'duplicate output language' };
			}
			const missing = expected.filter((language) => !languages.includes(language));
			const extra = languages.filter((language) => !(expected as string[]).includes(language));
			if (missing.length > 0 || extra.length > 0) {
				return {
					ok: false,
					reason: `output languages must be [${expected.join(', ')}], got [${languages.join(', ')}]`
				};
			}
			if (outputs.some((output) => output.text.length === 0)) {
				return { ok: false, reason: 'empty translation' };
			}
			const ordered = expected.map((language) =>
				outputs.find((output) => output.language === language)!
			);
			return {
				ok: true,
				decision: { kind: 'translate', sourceLanguage, outputs: ordered, repeatTurnId: null }
			};
		}
		case 'clarify': {
			const [answer] = outputs;
			if (outputs.length !== 1 || answer.language !== sourceLanguage) {
				return { ok: false, reason: 'clarify needs exactly one output in the source language' };
			}
			if (!isSupportedLanguage(answer.language)) {
				return { ok: false, reason: `cannot speak "${answer.language}"` };
			}
			if (answer.text.length === 0) {
				return { ok: false, reason: 'empty clarification' };
			}
			return {
				ok: true,
				decision: { kind: 'clarify', sourceLanguage, outputs: [answer], repeatTurnId: null }
			};
		}
		case 'repeat': {
			if (outputs.length > 0) {
				return { ok: false, reason: 'repeat must not have outputs' };
			}
			const turn = input.history.find((record) => record.id === decision.repeatTurnId);
			if (!turn) {
				return { ok: false, reason: `unknown turn "${decision.repeatTurnId}"` };
			}
			if (!turn.outputs.some((output) => output.language === sourceLanguage)) {
				return { ok: false, reason: `turn "${turn.id}" has no output in "${sourceLanguage}"` };
			}
			return {
				ok: true,
				decision: { kind: 'repeat', sourceLanguage, outputs: [], repeatTurnId: turn.id }
			};
		}
		case 'ignore':
			return {
				ok: true,
				decision: { kind: 'ignore', sourceLanguage, outputs: [], repeatTurnId: null }
			};
	}
}
