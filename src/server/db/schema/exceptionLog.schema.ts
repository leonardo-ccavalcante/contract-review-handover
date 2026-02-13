import { mysqlTable, varchar, text, timestamp, mysqlEnum, json } from 'drizzle-orm/mysql-core';

export const exceptionLog = mysqlTable('exception_log', {
  exception_id:   varchar('exception_id', { length: 50 }).primaryKey(),
  exception_type: varchar('exception_type', { length: 100 }).notNull(),
  severity:       mysqlEnum('severity', ['P1', 'P2', 'P3', 'P4']).notNull().default('P2'),
  status:         mysqlEnum('status', ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'IGNORED']).notNull().default('OPEN'),
  merchant_id:    varchar('merchant_id', { length: 50 }),
  workflow_step:  varchar('workflow_step', { length: 100 }),
  error_message:  text('error_message').notNull(),
  stack_trace:    text('stack_trace'),
  context_data:   json('context_data').$type<Record<string, unknown>>(),
  resolved_by:    varchar('resolved_by', { length: 100 }),
  resolved_at:    timestamp('resolved_at'),
  resolution_notes: text('resolution_notes'),
  created_at:     timestamp('created_at').defaultNow().notNull(),
});
