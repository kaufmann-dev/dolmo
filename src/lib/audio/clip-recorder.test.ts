import { describe, expect, it } from 'vitest';
import { clipFileName, pickMimeType } from './clip-recorder.ts';

describe('pickMimeType', () => {
	it('prefers Opus in WebM, then MP4, then plain WebM', () => {
		expect(pickMimeType(() => true)).toBe('audio/webm;codecs=opus');
		expect(pickMimeType((type) => type !== 'audio/webm;codecs=opus')).toBe('audio/mp4');
		expect(pickMimeType((type) => type === 'audio/webm')).toBe('audio/webm');
	});

	it('returns undefined when nothing is supported', () => {
		expect(pickMimeType(() => false)).toBeUndefined();
	});
});

describe('clipFileName', () => {
	it('names the file after its container', () => {
		expect(clipFileName('audio/mp4')).toBe('clip.m4a');
		expect(clipFileName('audio/webm;codecs=opus')).toBe('clip.webm');
		expect(clipFileName('')).toBe('clip.webm');
	});
});
