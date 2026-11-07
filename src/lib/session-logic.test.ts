import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TurnDecision, TurnRecord } from '#lib/turn.ts';
import {
	audioKey,
	buildHistory,
	findOutput,
	isSpeechText,
	speechItemsFor,
	waitWhile,
	type LoggedTurn
} from './session-logic.ts';

const translated: TurnRecord = {
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

const failed: LoggedTurn = { id: 't2', kind: 'error' };

describe('isSpeechText', () => {
	it('ignores text without letters or digits', () => {
		expect(isSpeechText('…!')).toBe(false);
		expect(isSpeechText('  ')).toBe(false);
		expect(isSpeechText('')).toBe(false);
	});

	it('keeps single characters and numbers', () => {
		expect(isSpeechText('好')).toBe(true);
		expect(isSpeechText('ok')).toBe(true);
		expect(isSpeechText('42')).toBe(true);
	});
});

describe('buildHistory', () => {
	it('drops error turns and keeps only the last turns', () => {
		const turns: LoggedTurn[] = [
			translated,
			failed,
			{ ...translated, id: 't3' },
			{ ...translated, id: 't4' }
		];
		expect(buildHistory(turns, 2).map((turn) => turn.id)).toEqual(['t3', 't4']);
	});

	it('returns only the fields Claude receives', () => {
		const [turn] = buildHistory(
			[{ ...translated, durationMs: 900, model: 'claude-sonnet-5-5' } as TurnRecord],
			5
		);
		expect(Object.keys(turn).sort()).toEqual(
			['id', 'kind', 'original', 'outputs', 'repeatTurnId', 'sourceLanguage'].sort()
		);
	});
});

describe('speechItemsFor', () => {
	it('creates one keyed item per translated output', () => {
		const decision: TurnDecision = {
			kind: 'translate',
			sourceLanguage: 'de',
			outputs: [
				{ language: 'tr', text: 'Bu ne kadar?' },
				{ language: 'uk', text: 'Скільки це коштує?' }
			],
			repeatTurnId: null
		};
		expect(speechItemsFor('t3', decision)).toEqual([
			{ key: audioKey('t3', 'tr'), text: 'Bu ne kadar?', language: 'tr' },
			{ key: audioKey('t3', 'uk'), text: 'Скільки це коштує?', language: 'uk' }
		]);
	});

	it('speaks a clarification but nothing for repeat or ignore', () => {
		const clarify: TurnDecision = {
			kind: 'clarify',
			sourceLanguage: 'uk',
			outputs: [{ language: 'uk', text: 'Він запитав про ціну.' }],
			repeatTurnId: null
		};
		const repeat: TurnDecision = {
			kind: 'repeat',
			sourceLanguage: 'uk',
			outputs: [],
			repeatTurnId: 't1'
		};
		const ignore: TurnDecision = {
			kind: 'ignore',
			sourceLanguage: 'uk',
			outputs: [],
			repeatTurnId: null
		};
		expect(speechItemsFor('t4', clarify)).toHaveLength(1);
		expect(speechItemsFor('t4', repeat)).toEqual([]);
		expect(speechItemsFor('t4', ignore)).toEqual([]);
	});
});

describe('findOutput', () => {
	const turns: LoggedTurn[] = [translated, failed];

	it('finds the output in a language', () => {
		expect(findOutput(turns, 't1', 'tr')?.text).toBe('Bu ne kadar?');
	});

	it('returns undefined for a missing language, an error turn or an unknown turn', () => {
		expect(findOutput(turns, 't1', 'fr')).toBeUndefined();
		expect(findOutput(turns, 't2', 'tr')).toBeUndefined();
		expect(findOutput(turns, 't9', 'tr')).toBeUndefined();
	});
});

describe('waitWhile', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns at once when the condition is already false', async () => {
		const done = vi.fn();
		await waitWhile(() => false, { maxMs: 1000, pollMs: 100 }).then(done);
		await vi.advanceTimersByTimeAsync(0);
		expect(done).toHaveBeenCalled();
	});

	it('keeps polling until the condition becomes false', async () => {
		let talking = true;
		const check = vi.fn(() => talking);
		const finished = vi.fn();
		waitWhile(check, { maxMs: 5000, pollMs: 100 }).then(finished);
		await vi.advanceTimersByTimeAsync(300);
		expect(finished).not.toHaveBeenCalled();
		talking = false;
		await vi.advanceTimersByTimeAsync(200);
		expect(finished).toHaveBeenCalled();
	});

	it('stops at the cap even if the condition stays true', async () => {
		const finished = vi.fn();
		waitWhile(() => true, { maxMs: 500, pollMs: 100 }).then(finished);
		await vi.advanceTimersByTimeAsync(600);
		expect(finished).toHaveBeenCalled();
	});
});
