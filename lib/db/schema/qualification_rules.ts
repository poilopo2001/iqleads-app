import { pgTable, uuid, varchar, timestamp, text, jsonb, boolean, integer } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const qualificationRules = pgTable('qualification_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Rule identification
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Rule configuration
  isActive: boolean('is_active').notNull().default(true),
  priority: integer('priority').notNull().default(0), // Higher priority rules run first

  // Conditions (JSON-based rule engine)
  conditions: jsonb('conditions').notNull(),
  /*
  Example:
  {
    "operator": "AND",
    "rules": [
      {
        "field": "company",
        "operator": "is_not_empty"
      },
      {
        "field": "customFields.budget",
        "operator": "greater_than",
        "value": 1000
      }
    ]
  }
  */

  // Actions to take when rule matches
  actions: jsonb('actions').notNull(),
  /*
  Example:
  {
    "scoreBonus": 20,
    "setTemperature": "hot",
    "autoCall": true,
    "assignTags": ["high-value", "enterprise"],
    "notifyChannels": ["slack", "email"]
  }
  */

  // AI Analysis configuration
  useAiAnalysis: boolean('use_ai_analysis').notNull().default(true),
  aiPromptTemplate: text('ai_prompt_template'),
  // Custom prompt for AI analysis specific to this rule

  // Call script configuration
  callScriptTemplate: text('call_script_template'),
  // Template for AI phone agent

  // Statistics
  timesTriggered: integer('times_triggered').default(0),
  leadsQualified: integer('leads_qualified').default(0),
  leadsDisqualified: integer('leads_disqualified').default(0),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type QualificationRule = typeof qualificationRules.$inferSelect;
export type NewQualificationRule = typeof qualificationRules.$inferInsert;
