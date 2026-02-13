import {
  mysqlTable,
  varchar,
  timestamp,
  boolean,
  int,
  json,
  mysqlEnum,
  text,
  decimal,
  index,
} from 'drizzle-orm/mysql-core';
import { contracts } from './contracts.schema';
import { merchants } from './merchants.schema';
import { callTranscriptions } from './callTranscriptions.schema';

// Contract Audit Log - tracks contract-call discrepancies found by AI auditor
export const contractAuditLog = mysqlTable(
  'contract_audit_log',
  {
    // Primary Key
    audit_id: varchar('audit_id', { length: 50 }).primaryKey(),

    // Foreign Keys
    contract_id: varchar('contract_id', { length: 50 }).notNull(),
    merchant_id: varchar('merchant_id', { length: 50 }).notNull(),
    source_call_id: varchar('source_call_id', { length: 50 }),

    // Audit Details
    audit_timestamp: timestamp('audit_timestamp').defaultNow().notNull(),
    audited_by: mysqlEnum('audited_by', ['AI', 'Human']).default('AI'),
    ai_model: varchar('ai_model', { length: 50 }),

    // Results
    discrepancies_found: boolean('discrepancies_found').notNull(),
    discrepancy_count: int('discrepancy_count').default(0),

    // Discrepancy Details (JSON Array)
    discrepancies: json('discrepancies').$type<
      Array<{
        field: string;
        verbal_promise: string;
        contract_term: string;
        call_timestamp: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        impact: string;
      }>
    >(),

    // Routing
    action_required: mysqlEnum('action_required', [
      'NONE',
      'SALES_OPS_REVIEW',
      'URGENT_ESCALATION',
    ]).notNull(),
    blocks_go_live: boolean('blocks_go_live').default(false),
    sla_hours: int('sla_hours'),

    // Resolution
    resolution_status: mysqlEnum('resolution_status', [
      'Pending',
      'In Progress',
      'Resolved',
      'Accepted Risk',
    ]).default('Pending'),
    resolved_by: varchar('resolved_by', { length: 50 }),
    resolved_at: timestamp('resolved_at'),
    resolution_notes: text('resolution_notes'),

    // Audit Fields
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    contractIdx: index('idx_contract').on(table.contract_id),
    merchantIdx: index('idx_merchant').on(table.merchant_id),
    discrepanciesFoundIdx: index('idx_discrepancies_found').on(
      table.discrepancies_found
    ),
    resolutionStatusIdx: index('idx_resolution_status').on(
      table.resolution_status
    ),
    auditTimestampIdx: index('idx_audit_timestamp').on(table.audit_timestamp),
  })
);

// Type exports
export type ContractAuditLog = typeof contractAuditLog.$inferSelect;
export type NewContractAuditLog = typeof contractAuditLog.$inferInsert;
