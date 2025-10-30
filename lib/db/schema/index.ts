// Export all schemas
export * from './organizations';
export * from './users';
export * from './leads';
export * from './call_logs';
export * from './lead_sources';
export * from './qualification_rules';
export * from './notification_channels';
export * from './organization_credentials';

// Define relations
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { users } from './users';
import { leads } from './leads';
import { callLogs } from './call_logs';
import { leadSources } from './lead_sources';
import { qualificationRules } from './qualification_rules';
import { notificationChannels } from './notification_channels';
import { organizationCredentials } from './organization_credentials';

// Organization relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  leads: many(leads),
  callLogs: many(callLogs),
  leadSources: many(leadSources),
  qualificationRules: many(qualificationRules),
  notificationChannels: many(notificationChannels),
  credentials: many(organizationCredentials),
}));

// User relations
export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

// Lead relations
export const leadsRelations = relations(leads, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leads.organizationId],
    references: [organizations.id],
  }),
  source: one(leadSources, {
    fields: [leads.sourceId],
    references: [leadSources.id],
  }),
  callLogs: many(callLogs),
}));

// Call log relations
export const callLogsRelations = relations(callLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [callLogs.organizationId],
    references: [organizations.id],
  }),
  lead: one(leads, {
    fields: [callLogs.leadId],
    references: [leads.id],
  }),
}));

// Lead source relations
export const leadSourcesRelations = relations(leadSources, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leadSources.organizationId],
    references: [organizations.id],
  }),
  leads: many(leads),
  qualificationRule: one(qualificationRules, {
    fields: [leadSources.qualificationRuleId],
    references: [qualificationRules.id],
  }),
}));

// Qualification rule relations
export const qualificationRulesRelations = relations(qualificationRules, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [qualificationRules.organizationId],
    references: [organizations.id],
  }),
  leadSources: many(leadSources),
}));

// Notification channel relations
export const notificationChannelsRelations = relations(notificationChannels, ({ one }) => ({
  organization: one(organizations, {
    fields: [notificationChannels.organizationId],
    references: [organizations.id],
  }),
}));

// Organization credentials relations
export const organizationCredentialsRelations = relations(organizationCredentials, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationCredentials.organizationId],
    references: [organizations.id],
  }),
}));
