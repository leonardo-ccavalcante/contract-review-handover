import {
  mysqlTable,
  varchar,
  timestamp,
  json,
  index,
  mysqlEnum,
  text,
} from 'drizzle-orm/mysql-core';

/**
 * Profile Activity Log - tracks all changes to merchant profiles
 * Used for audit trail and update tracking (Phase 6)
 */
export const profileActivityLog = mysqlTable(
  'profile_activity_log',
  {
    activity_id: varchar('activity_id', { length: 50 }).primaryKey(),
    profile_id: varchar('profile_id', { length: 50 }).notNull(),
    merchant_id: varchar('merchant_id', { length: 50 }).notNull(),

    // What happened
    activity_type: mysqlEnum('activity_type', [
      'CREATED',
      'UPDATED',
      'VERSION_SUPERSEDED',
      'REVIEWED',
      'SUMMARY_GENERATED',
      'FIELD_CORRECTED',
    ]).notNull(),

    // Who did it
    performed_by: varchar('performed_by', { length: 100 }).notNull(),
    performed_by_role: varchar('performed_by_role', { length: 50 }),

    // What changed (for UPDATED, FIELD_CORRECTED)
    changed_fields: json('changed_fields').$type<
      Array<{
        field: string;
        old_value: any;
        new_value: any;
      }>
    >(),

    // Notes
    notes: text('notes'),

    // New profile version created (if applicable)
    new_profile_version: varchar('new_profile_version', { length: 50 }),

    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    profileIdx: index('idx_pal_profile').on(table.profile_id),
    merchantIdx: index('idx_pal_merchant').on(table.merchant_id),
    activityTypeIdx: index('idx_pal_activity_type').on(table.activity_type),
    createdAtIdx: index('idx_pal_created_at').on(table.created_at),
  })
);

export type ProfileActivityLog = typeof profileActivityLog.$inferSelect;
export type NewProfileActivityLog = typeof profileActivityLog.$inferInsert;
