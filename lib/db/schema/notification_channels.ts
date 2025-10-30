import { pgTable, uuid, varchar, timestamp, text, jsonb, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const notificationChannels = pgTable('notification_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Channel identification
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  // slack|email|webhook|sms|whatsapp

  // Channel configuration
  isActive: boolean('is_active').notNull().default(true),

  // Channel-specific settings (encrypted)
  config: jsonb('config').notNull(),
  /*
  Example for Slack:
  {
    "webhookUrl": "https://hooks.slack.com/services/...",
    "channel": "#leads"
  }

  Example for Email:
  {
    "recipients": ["team@company.com", "sales@company.com"]
  }

  Example for Webhook:
  {
    "url": "https://api.company.com/leads",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer token"
    }
  }
  */

  // Event filters
  eventFilters: jsonb('event_filters'),
  /*
  Example:
  {
    "events": ["lead.qualified", "lead.converted", "call.completed"],
    "leadTemperature": ["hot"],
    "minScore": 70
  }
  */

  // Message template
  messageTemplate: text('message_template'),
  // Template for notification messages with variables

  // Timestamps
  lastNotificationSentAt: timestamp('last_notification_sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type NotificationChannel = typeof notificationChannels.$inferSelect;
export type NewNotificationChannel = typeof notificationChannels.$inferInsert;
