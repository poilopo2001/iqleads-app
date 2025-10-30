import { pgTable, uuid, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const organizationCredentials = pgTable('organization_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Credential identification
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  // telnyx|twilio|openrouter|hubspot|elevenlabs

  // Encrypted credentials
  encryptedApiKey: text('encrypted_api_key').notNull(),
  encryptedApiSecret: text('encrypted_api_secret'),

  // Additional settings
  isActive: boolean('is_active').notNull().default(true),

  // Metadata
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OrganizationCredential = typeof organizationCredentials.$inferSelect;
export type NewOrganizationCredential = typeof organizationCredentials.$inferInsert;
