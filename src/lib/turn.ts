import { z } from 'zod';
import { EFFORTS, MODEL_IDS } from '#lib/models.ts';
import { SUPPORTED_LANGUAGES } from '#lib/languages.ts';

export const TURN_KINDS = ['translate', 'repeat', 'clarify', 'ignore'] as const;

export type TurnKind = (typeof TURN_KINDS)[number];

export const MAX_UTTERANCE_LENGTH = 2000;
export const MAX_HISTORY_TURNS = 30;

/**
 * What Claude returns for one utterance. This is the structured output schema, so it stays
 * free of constraints the API may not enforce; `validateDecision` checks the rest.
 */
export const TurnDecision = z.object({
	kind: z.enum(TURN_KINDS),
	sourceLanguage: z.string(),
	outputs: z.array(z.object({ language: z.string(), text: z.string() })),
	repeatTurnId: z.string().nullable()
});

export type TurnDecision = z.infer<typeof TurnDecision>;

/** A finished turn as kept in the conversation log and sent back as history. */
export const TurnRecord = z.object({
	id: z.string().min(1).max(64),
	kind: z.enum(TURN_KINDS),
	sourceLanguage: z.string().min(2).max(3),
	original: z.string().max(MAX_UTTERANCE_LENGTH),
	outputs: z
		.array(
			z.object({
				language: z.string().min(2).max(3),
				text: z.string().max(MAX_UTTERANCE_LENGTH * 2)
			})
		)
		.max(SUPPORTED_LANGUAGES.length),
	repeatTurnId: z.string().max(64).nullable()
});

export type TurnRecord = z.infer<typeof TurnRecord>;

export const DecideTurnInput = z.object({
	languages: z
		.array(z.enum(SUPPORTED_LANGUAGES))
		.min(2)
		.refine((codes) => new Set(codes).size === codes.length, 'Languages must be distinct'),
	model: z.enum(MODEL_IDS),
	effort: z.enum(EFFORTS),
	utterance: z.string().trim().min(1).max(MAX_UTTERANCE_LENGTH),
	history: z.array(TurnRecord).max(MAX_HISTORY_TURNS)
});

export type DecideTurnInput = z.infer<typeof DecideTurnInput>;

export type DecideTurnResult =
	{ ok: true; decision: TurnDecision } | { ok: false; message: string };
