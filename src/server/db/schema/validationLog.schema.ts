import {
  mysqlTable,
  varchar,
  timestamp,
  mysqlEnum,
  boolean,
  json,
  index,
} from 'drizzle-orm/mysql-core';
import { aiExtractions } from './aiExtractions.schema';
import { merchants } from './merchantProfiles.schema';

export const validationLog = mysqlTable(
  'validation_log',
  {
    validation_id: varchar('validation_id', { length: 50 }).primaryKey(),
    extraction_id: varchar('extraction_id', { length: 50 })
      .notNull()
      .references(() => aiExtractions.extraction_id),
    merchant_id: varchar('merchant_id', { length: 50 })
      .notNull()
      .references(() => merchants.merchant_id),

    // Validation Results
    validation_status: mysqlEnum('validation_status', [
      'PASS',
      'FAIL',
      'MANUAL_REVIEW',
      'OVERRIDE',
    ]).notNull(),
    validation_timestamp: timestamp('validation_timestamp').defaultNow().notNull(),

    // Validation Details
    mandatory_fields_complete: boolean('mandatory_fields_complete').notNull(),
    ai_confidence_threshold_met: boolean('ai_confidence_threshold_met').notNull(),
    missing_fields: json('missing_fields').$type<string[]>(),
    low_confidence_fields: json('low_confidence_fields').$type<string[]>(),

    // Routing
    next_action: mysqlEnum('next_action', [
      'PROCEED_TO_CONTRACT',
      'ROUTE_TO_SALES_OPS',
      'BLOCK',
      'GENERATE_RETRY_INTEL',
    ]).notNull(),
    blocking_reasons: json('blocking_reasons').$type<string[]>(),

    // Override Details
    override_by: varchar('override_by', { length: 50 }),
    override_justification: varchar('override_justification', { length: 1000 }),
    override_timestamp: timestamp('override_timestamp'),

    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index('idx_status').on(table.validation_status),
    timestampIdx: index('idx_timestamp').on(table.validation_timestamp),
    merchantIdx: index('idx_merchant').on(table.merchant_id),
    nextActionIdx: index('idx_next_action').on(table.next_action),
  })
);

export type ValidationLog = typeof validationLog.$inferSelect;
export type NewValidationLog = typeof validationLog.$inferInsert;
