import { describe, expect, it } from 'vitest';
import { safeReturnPath } from './redirect.ts';

describe('safeReturnPath', () => {
	it('keeps same-origin app paths with query and hash', () => {
		expect(safeReturnPath('/')).toBe('/');
		expect(safeReturnPath('/?lang=de#log')).toBe('/?lang=de#log');
	});

	it('falls back to / for missing, external or protocol-relative targets', () => {
		expect(safeReturnPath(null)).toBe('/');
		expect(safeReturnPath('')).toBe('/');
		expect(safeReturnPath('https://evil.example')).toBe('/');
		expect(safeReturnPath('//evil.example/path')).toBe('/');
		expect(safeReturnPath('/\\evil.example')).toBe('/');
		expect(safeReturnPath('javascript:alert(1)')).toBe('/');
	});

	it('never returns to the login screen or an API route', () => {
		expect(safeReturnPath('/login')).toBe('/');
		expect(safeReturnPath('/api/auth/sign-out')).toBe('/');
	});
});
