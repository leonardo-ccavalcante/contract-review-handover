import { mysqlTable, varchar, text, timestamp } from 'drizzle-orm/mysql-core';

export const systemSettings = mysqlTable('system_settings', {
  setting_key:   varchar('setting_key', { length: 100 }).primaryKey(),
  setting_value: text('setting_value').notNull(),
  setting_type:  varchar('setting_type', { length: 20 }).notNull().default('string'),
  description:   text('description'),
  updated_by:    varchar('updated_by', { length: 100 }),
  updated_at:    timestamp('updated_at').onUpdateNow(),
});
