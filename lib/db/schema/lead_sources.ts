import { pgTable, uuid, varchar, timestamp, text, jsonb, boolean, integer } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const leadSources = pgTable('lead_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Source identification
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(),
  // webhook|wordpress|woocommerce|shopify|zapier|api|manual

  // Webhook configuration
  webhookToken: varchar('webhook_token', { length: 255 }).notNull().unique(),
  webhookUrl: varchar('webhook_url', { length: 500 }), // Generated URL for this source

  // Source settings
  isActive: boolean('is_active').notNull().default(true),
  autoQualify: boolean('auto_qualify').notNull().default(true), // Automatically trigger qualification
  autoCall: boolean('auto_call').notNull().default(false), // Automatically call qualified leads

  // Field mapping configuration
  fieldMapping: jsonb('field_mapping'), // Map webhook fields to lead fields
  /*
  Example:
  {
    "email": "customer_email",
    "phone": "billing_phone",
    "firstName": "first_name",
    "company": "company_name"
  }
  */

  // Qualification rules for this source
  qualificationRuleId: uuid('qualification_rule_id'), // References qualification_rules.id

  // Statistics
  totalLeadsReceived: integer('total_leads_received').default(0),
  lastLeadReceivedAt: timestamp('last_lead_received_at', { withTimezone: true }),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type LeadSource = typeof leadSources.$inferSelect;
export type NewLeadSource = typeof leadSources.$inferInsert;
