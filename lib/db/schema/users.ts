import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // References auth.users(id) from Supabase Auth
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),

  // Role within organization
  role: varchar('role', { length: 50 }).notNull().default('member'), // owner|admin|member

  // Status
  isActive: boolean('is_active').notNull().default(true),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
