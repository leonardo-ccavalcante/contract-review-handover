import { mysqlTable, varchar, int, decimal, boolean, timestamp, json, text } from 'drizzle-orm/mysql-core';

export const validationRules = mysqlTable('validation_rules', {
  rule_id:               varchar('rule_id', { length: 50 }).primaryKey(),
  rule_name:             varchar('rule_name', { length: 100 }).notNull(),
  confidence_threshold:  int('confidence_threshold').notNull().default(90),
  mandatory_fields:      json('mandatory_fields').$type<string[]>().notNull(),
  override_requires_justification_min_chars: int('override_min_chars').notNull().default(50),
  sales_ops_sla_hours:   int('sales_ops_sla_hours').notNull().default(2),
  is_active:             boolean('is_active').notNull().default(true),
  updated_by:            varchar('updated_by', { length: 100 }),
  notes:                 text('notes'),
  updated_at:            timestamp('updated_at').onUpdateNow(),
});
