import { mysqlTable, varchar, text, timestamp, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';

export const notifications = mysqlTable('notifications', {
  notification_id:   varchar('notification_id', { length: 50 }).primaryKey(),
  recipient_id:      varchar('recipient_id', { length: 100 }).notNull(),
  recipient_role:    varchar('recipient_role', { length: 50 }),
  notification_type: mysqlEnum('notification_type', [
    'VALIDATION_FAILED',
    'VALIDATION_PASSED',
    'MANUAL_REVIEW_REQUIRED',
    'OVERRIDE_REQUESTED',
    'OVERRIDE_APPROVED',
    'AUDIT_DISCREPANCY',
    'AUDIT_RESOLVED',
    'PROFILE_CREATED',
    'PROFILE_UPDATED',
    'SYSTEM_ALERT',
  ]).notNull(),
  title:     varchar('title', { length: 255 }).notNull(),
  message:   text('message').notNull(),
  entity_type: varchar('entity_type', { length: 50 }),
  entity_id:   varchar('entity_id', { length: 50 }),
  action_url:  varchar('action_url', { length: 500 }),
  is_read:     boolean('is_read').notNull().default(false),
  read_at:     timestamp('read_at'),
  created_at:  timestamp('created_at').defaultNow().notNull(),
});
