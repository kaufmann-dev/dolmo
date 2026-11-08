import { command } from '$app/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { MAX_PINNED_LANGUAGES, SUPPORTED_LANGUAGES } from '#lib/languages.ts';
import { db } from '#lib/server/db/index.ts';
import { pinnedLanguage } from '#lib/server/db/schema.ts';
import { requireUser } from '#lib/server/session.ts';

const PinnedLanguages = z
	.array(z.enum(SUPPORTED_LANGUAGES))
	.max(MAX_PINNED_LANGUAGES)
	.refine((codes) => new Set(codes).size === codes.length, 'Languages must be distinct');

/** Replaces the signed-in user's pinned languages with exactly this list. */
export const savePinnedLanguages = command(PinnedLanguages, async (codes) => {
	const { id: userId } = requireUser();
	await db.transaction(async (tx) => {
		await tx.delete(pinnedLanguage).where(eq(pinnedLanguage.userId, userId));
		if (codes.length > 0) {
			await tx.insert(pinnedLanguage).values(codes.map((code) => ({ userId, code })));
		}
	});
});
