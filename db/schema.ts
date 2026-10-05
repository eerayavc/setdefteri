import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', { userId: text('user_id').notNull(), id: text('id').notNull(), payload: text('payload').notNull(), updated: integer('updated').notNull() }, t=>[primaryKey({columns:[t.userId,t.id]})]);
