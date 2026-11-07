import { describe, expect, it } from 'vitest';
import type { DecideTurnInput, TurnDecision, TurnRecord } from '#lib/turn.ts';
import { validateDecision } from './turn-validation.ts';

const previous: TurnRecord = {
	id: 't1',
	kind: 'translate',
	sourceLanguage: 'de',
	original: 'Wie viel kostet das?',
	outputs: [
		{ language: 'tr', text: 'Bu ne kadar?' },
		{ language: 'uk', text: 'Скільки це коштує?' }
	],
	repeatTurnId: null
};

const input: DecideTurnInput = {
	languages: ['de', 'tr', 'uk'],
	model: 'claude-opus-5-5',
	effort: 'low',
	utterance: 'irrelevant here',
	history: [previous]
};

function decision(overrides: Partial<TurnDecision>): TurnDecision {
	return { kind: 'translate', sourceLanguage: 'de', outputs: [], repeatTurnId: null, ...overrides };
}

describe('validateDecision', () => {
	it('accepts a translation into every other language and orders it by session language', () => {
		const result = validateDecision(
			decision({
				outputs: [
					{ language: 'uk', text: ' Привіт ' },
					{ language: 'tr', text: 'Merhaba' }
				],
				repeatTurnId: 't1'
			}),
			input
		);
		expect(result).toEqual({
			ok: true,
			decision: {
				kind: 'translate',
				sourceLanguage: 'de',
				outputs: [
					{ language: 'tr', text: 'Merhaba' },
					{ language: 'uk', text: 'Привіт' }
				],
				repeatTurnId: null
			}
		});
	});

	it('translates into all session languages when the speaker uses another language', () => {
		const result = validateDecision(
			decision({
				sourceLanguage: 'en',
				outputs: [
					{ language: 'de', text: 'Hallo' },
					{ language: 'tr', text: 'Merhaba' },
					{ language: 'uk', text: 'Привіт' }
				]
			}),
			input
		);
		expect(result.ok).toBe(true);
	});

	it('rejects a translation that misses a language', () => {
		const result = validateDecision(
			decision({ outputs: [{ language: 'tr', text: 'Merhaba' }] }),
			input
		);
		expect(result.ok).toBe(false);
	});

	it('rejects a translation back into the source language', () => {
		const result = validateDecision(
			decision({
				outputs: [
					{ language: 'de', text: 'Hallo' },
					{ language: 'tr', text: 'Merhaba' },
					{ language: 'uk', text: 'Привіт' }
				]
			}),
			input
		);
		expect(result.ok).toBe(false);
	});

	it('rejects duplicate and empty translations', () => {
		const duplicate = validateDecision(
			decision({
				outputs: [
					{ language: 'tr', text: 'Merhaba' },
					{ language: 'tr', text: 'Selam' },
					{ language: 'uk', text: 'Привіт' }
				]
			}),
			input
		);
		const empty = validateDecision(
			decision({
				outputs: [
					{ language: 'tr', text: '  ' },
					{ language: 'uk', text: 'Привіт' }
				]
			}),
			input
		);
		expect(duplicate.ok).toBe(false);
		expect(empty.ok).toBe(false);
	});

	it('accepts a clarification answered only in the asking language', () => {
		const result = validateDecision(
			decision({
				kind: 'clarify',
				sourceLanguage: 'uk',
				outputs: [{ language: 'uk', text: 'Він запитав про ціну.' }]
			}),
			input
		);
		expect(result.ok).toBe(true);
	});

	it('rejects a clarification in another language or with several outputs', () => {
		const wrongLanguage = validateDecision(
			decision({
				kind: 'clarify',
				sourceLanguage: 'uk',
				outputs: [{ language: 'tr', text: 'Fiyatı sordu.' }]
			}),
			input
		);
		const tooMany = validateDecision(
			decision({
				kind: 'clarify',
				sourceLanguage: 'uk',
				outputs: [
					{ language: 'uk', text: 'Він запитав про ціну.' },
					{ language: 'uk', text: 'Ще раз.' }
				]
			}),
			input
		);
		expect(wrongLanguage.ok).toBe(false);
		expect(tooMany.ok).toBe(false);
	});

	it('accepts a repeat of a known turn that has the asking language', () => {
		const result = validateDecision(
			decision({ kind: 'repeat', sourceLanguage: 'uk', repeatTurnId: 't1' }),
			input
		);
		expect(result).toEqual({
			ok: true,
			decision: { kind: 'repeat', sourceLanguage: 'uk', outputs: [], repeatTurnId: 't1' }
		});
	});

	it('rejects a repeat of an unknown turn or one without the asking language', () => {
		const unknown = validateDecision(
			decision({ kind: 'repeat', sourceLanguage: 'uk', repeatTurnId: 't9' }),
			input
		);
		const ownLanguage = validateDecision(
			decision({ kind: 'repeat', sourceLanguage: 'de', repeatTurnId: 't1' }),
			input
		);
		const withOutputs = validateDecision(
			decision({
				kind: 'repeat',
				sourceLanguage: 'uk',
				repeatTurnId: 't1',
				outputs: [{ language: 'uk', text: 'Скільки це коштує?' }]
			}),
			input
		);
		expect(unknown.ok).toBe(false);
		expect(ownLanguage.ok).toBe(false);
		expect(withOutputs.ok).toBe(false);
	});

	it('clears outputs of an ignored turn', () => {
		const result = validateDecision(
			decision({ kind: 'ignore', outputs: [{ language: 'tr', text: 'Hmm' }] }),
			input
		);
		expect(result).toEqual({
			ok: true,
			decision: { kind: 'ignore', sourceLanguage: 'de', outputs: [], repeatTurnId: null }
		});
	});

	it('rejects an invalid source language code', () => {
		const result = validateDecision(decision({ kind: 'ignore', sourceLanguage: 'German' }), input);
		expect(result.ok).toBe(false);
	});

	describe('push to listen', () => {
		const pushed: DecideTurnInput = { ...input, pushToListen: true };

		it('accepts translations and ignored segments', () => {
			const translation = validateDecision(
				decision({
					outputs: [
						{ language: 'tr', text: 'Merhaba' },
						{ language: 'uk', text: 'Привіт' }
					]
				}),
				pushed
			);
			expect(translation.ok).toBe(true);
			expect(validateDecision(decision({ kind: 'ignore' }), pushed).ok).toBe(true);
		});

		it('rejects repeat and clarify, which would answer Dolmo instead of translating', () => {
			const repeat = validateDecision(
				decision({ kind: 'repeat', sourceLanguage: 'uk', repeatTurnId: 't1' }),
				pushed
			);
			const clarify = validateDecision(
				decision({
					kind: 'clarify',
					sourceLanguage: 'uk',
					outputs: [{ language: 'uk', text: 'Він запитав про ціну.' }]
				}),
				pushed
			);
			expect(repeat.ok).toBe(false);
			expect(clarify.ok).toBe(false);
		});
	});
});
