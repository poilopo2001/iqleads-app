import { pgTable, uuid, varchar, timestamp, integer, text, jsonb, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { leads } from './leads';

export const callLogs = pgTable('call_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),

  // Call details
  callSid: varchar('call_sid', { length: 255 }), // Twilio/Telnyx call ID
  direction: varchar('direction', { length: 20 }).notNull(), // outbound|inbound
  status: varchar('status', { length: 50 }).notNull().default('initiated'),
  // initiated|ringing|in_progress|completed|failed|busy|no_answer|canceled

  fromNumber: varchar('from_number', { length: 50 }),
  toNumber: varchar('to_number', { length: 50 }),

  // Call metrics
  duration: integer('duration'), // Duration in seconds
  recordingUrl: varchar('recording_url', { length: 500 }),
  recordingDuration: integer('recording_duration'),

  // Transcription
  transcription: text('transcription'),
  transcriptionStatus: varchar('transcription_status', { length: 50 }),
  // pending|completed|failed

  // AI Analysis
  aiAnalysis: jsonb('ai_analysis'), // LLM analysis of the call
  sentimentScore: integer('sentiment_score'), // -100 to 100
  qualificationScore: integer('qualification_score'), // 0-100
  keyPoints: varchar('key_points', { length: 255 }).array(), // Key takeaways

  // Call outcome
  outcome: varchar('outcome', { length: 50 }),
  // qualified|disqualified|callback_requested|voicemail|no_answer|wrong_number

  notes: text('notes'),
  nextAction: text('next_action'), // AI suggested next action

  // Cost tracking
  costCredits: integer('cost_credits').default(1), // Credits consumed

  // Provider metadata
  providerData: jsonb('provider_data'), // Raw data from Twilio/Telnyx

  // Timestamps
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CallLog = typeof callLogs.$inferSelect;
export type NewCallLog = typeof callLogs.$inferInsert;
