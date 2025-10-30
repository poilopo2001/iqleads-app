import { pgTable, uuid, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),

  // Stripe integration
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  subscriptionPlan: varchar('subscription_plan', { length: 50 })
    .notNull()
    .default('free'), // free|starter|pro|enterprise
  subscriptionStatus: varchar('subscription_status', { length: 50 }), // active|canceled|past_due
  subscriptionId: varchar('subscription_id', { length: 255 }),

  // Credits for phone calls
  creditsBalance: integer('credits_balance').notNull().default(10),

  // Organization settings
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  language: varchar('language', { length: 10 }).default('en'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
