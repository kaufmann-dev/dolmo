import { eq } from 'drizzle-orm';
import { isSupportedLanguage } from '#lib/languages.ts';
import { db } from '#lib/server/db/index.ts';
import { pinnedLanguage } from '#lib/server/db/schema.ts';
import { requireUser } from '#lib/server/session.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { id: userId } = requireUser();
	const rows = await db
		.select({ code: pinnedLanguage.code })
		.from(pinnedLanguage)
		.where(eq(pinnedLanguage.userId, userId));

	return { pinnedLanguages: rows.map((row) => row.code).filter(isSupportedLanguage) };
};
