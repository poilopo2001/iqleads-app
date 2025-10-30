import { pgTable, uuid, varchar, timestamp, integer, text, jsonb, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Contact information
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),

  // Lead source
  sourceId: uuid('source_id'), // References lead_sources.id (will add relation later)
  sourceType: varchar('source_type', { length: 50 }), // webhook|manual|import|api

  // Status and scoring
  status: varchar('status', { length: 50 }).notNull().default('new'),
  // new|pre_qualified|call_scheduled|called|qualified|disqualified|converted

  leadScore: integer('lead_score').default(0), // 0-100
  temperature: varchar('temperature', { length: 20 }).default('cold'), // cold|warm|hot

  // AI Analysis
  preQualificationScore: integer('pre_qualification_score'), // First AI analysis
  finalQualificationScore: integer('final_qualification_score'), // After call analysis
  aiNotes: text('ai_notes'), // AI-generated insights

  // Call tracking
  callAttempts: integer('call_attempts').default(0),
  lastCallAt: timestamp('last_call_at', { withTimezone: true }),
  nextCallScheduledAt: timestamp('next_call_scheduled_at', { withTimezone: true }),

  // Custom fields and metadata
  customFields: jsonb('custom_fields'), // Flexible JSON for user-defined fields
  rawData: jsonb('raw_data'), // Original webhook payload
  tags: varchar('tags', { length: 255 }).array(), // Array of tags

  // Consent and compliance
  consentToCall: boolean('consent_to_call').default(false),
  consentToEmail: boolean('consent_to_email').default(false),
  doNotContact: boolean('do_not_contact').default(false),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  convertedAt: timestamp('converted_at', { withTimezone: true }),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
