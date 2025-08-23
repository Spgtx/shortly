import { pgTable, text, timestamp, integer, boolean, uuid, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  username: text('username').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accounts = pgTable('account', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const verificationTokens = pgTable('verificationTokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => ({
  pk: primaryKey(table.identifier, table.token),
}));


export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const links = pgTable('links', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  originalUrl: text('original_url').notNull(),
  shortCode: text('short_code').notNull().unique(),
  title: text('title'),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  clickCount: integer('click_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  shortCodeIdx: index('short_code_idx').on(table.shortCode),
  userIdIdx: index('user_id_idx').on(table.userId),
}));

export const clicks = pgTable('clicks', {
  id: uuid('id').defaultRandom().primaryKey(),
  linkId: uuid('link_id').references(() => links.id, { onDelete: 'cascade' }).notNull(),
  userAgent: text('user_agent'),
  referer: text('referer'),
  ipAddress: text('ip_address'),
  country: text('country'),
  city: text('city'),
  clickedAt: timestamp('clicked_at').defaultNow().notNull(),
}, (table) => ({
  linkIdIdx: index('link_id_idx').on(table.linkId),
  clickedAtIdx: index('clicked_at_idx').on(table.clickedAt),
}));

export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, { fields: [links.userId], references: [users.id] }),
  clicks: many(clicks),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(links, { fields: [clicks.linkId], references: [links.id] }),
}));

export type User = typeof users.$inferSelect;
export type Link = typeof links.$inferSelect;
export type Click = typeof clicks.$inferSelect;