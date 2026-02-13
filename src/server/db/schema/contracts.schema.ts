import {
  mysqlTable,
  varchar,
  timestamp,
  date,
  mysqlEnum,
  text,
  int,
  index,
} from 'drizzle-orm/mysql-core';
import { merchants } from './merchants.schema';
import { aiExtractions } from './aiExtractions.schema';

// Contracts - stores signed contract documents and metadata
export const contracts = mysqlTable(
  'contracts',
  {
    // Primary Key
    contract_id: varchar('contract_id', { length: 50 }).primaryKey(),

    // Foreign Keys
    merchant_id: varchar('merchant_id', { length: 50 }).notNull(),
    source_extraction_id: varchar('source_extraction_id', { length: 50 }),

    // Contract Details
    contract_status: mysqlEnum('contract_status', [
      'Draft',
      'Sent',
      'Signed',
      'Active',
      'Expired',
      'Terminated',
    ]).notNull(),
    signed_at: timestamp('signed_at'),
    effective_date: date('effective_date'),
    expiration_date: date('expiration_date'),
    go_live_date: timestamp('go_live_date'),

    // Document Storage
    pdf_url: varchar('pdf_url', { length: 512 }),
    pdf_storage_path: varchar('pdf_storage_path', { length: 512 }),
    pdf_hash: varchar('pdf_hash', { length: 64 }),

    // Contract Terms (Extracted)
    commission: varchar('commission', { length: 20 }),
    campaign_type: varchar('campaign_type', { length: 255 }),
    campaign_duration: int('campaign_duration'),
    tablet_terms: text('tablet_terms'),
    contract_length: int('contract_length'),
    special_clauses: text('special_clauses'),

    // Signatures
    merchant_signature_date: timestamp('merchant_signature_date'),
    bolt_signature_date: timestamp('bolt_signature_date'),
    signed_via: mysqlEnum('signed_via', [
      'DocuSign',
      'PandaDoc',
      'Manual',
      'API',
    ]).default('DocuSign'),

    // Audit Fields
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at')
      .defaultNow()
      .onUpdateNow()
      .notNull(),
    created_by: varchar('created_by', { length: 50 }),
  },
  (table) => ({
    merchantIdx: index('idx_merchant').on(table.merchant_id),
    statusIdx: index('idx_status').on(table.contract_status),
    signedAtIdx: index('idx_signed_at').on(table.signed_at),
    goLiveDateIdx: index('idx_go_live_date').on(table.go_live_date),
  })
);

// Type exports
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
