import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export * from './auth.schema';

/** Languages a user pinned to the top of the language grid, one row per language. */
export const pinnedLanguage = pgTable(
	'pinned_language',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		code: text('code').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [primaryKey({ columns: [table.userId, table.code] })]
);
