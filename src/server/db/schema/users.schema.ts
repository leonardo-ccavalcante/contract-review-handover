import { mysqlTable, varchar, timestamp, boolean, mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  user_id:     varchar('user_id', { length: 50 }).primaryKey(),
  email:       varchar('email', { length: 255 }).notNull(),
  name:        varchar('name', { length: 255 }).notNull(),
  role:        mysqlEnum('role', ['Admin', 'Sales Manager', 'Regional Director', 'Sales Ops', 'Account Manager']).notNull().default('Account Manager'),
  team:        varchar('team', { length: 100 }),
  region:      varchar('region', { length: 100 }),
  is_active:   boolean('is_active').notNull().default(true),
  last_login:  timestamp('last_login'),
  created_at:  timestamp('created_at').defaultNow().notNull(),
  updated_at:  timestamp('updated_at').onUpdateNow(),
});
