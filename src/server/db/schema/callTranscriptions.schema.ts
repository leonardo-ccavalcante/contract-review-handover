import {
  mysqlTable,
  varchar,
  date,
  int,
  mysqlEnum,
  longtext,
  bigint,
  timestamp,
  index,
} from 'drizzle-orm/mysql-core';
import { merchants } from './merchants.schema';

// Call Transcriptions - store raw call transcriptions from sales conversations
export const callTranscriptions = mysqlTable(
  'call_transcriptions',
  {
    // Primary Key
    call_id: varchar('call_id', { length: 50 }).primaryKey(),

    // Foreign Keys
    merchant_id: varchar('merchant_id', { length: 50 }).notNull(),
    sales_manager_id: varchar('sales_manager_id', { length: 50 }).notNull(),

    // Call Details
    call_date: date('call_date').notNull(),
    call_duration_minutes: int('call_duration_minutes'),
    call_type: mysqlEnum('call_type', [
      'Discovery',
      'Negotiation',
      'Closing',
      'Follow-up',
    ]).notNull(),

    // Transcription Content
    transcription_text: longtext('transcription_text').notNull(),
    transcription_format: mysqlEnum('transcription_format', [
      'txt',
      'json',
      'srt',
    ]).default('txt'),

    // File Metadata
    file_size_bytes: bigint('file_size_bytes', { mode: 'number' }),
    file_hash: varchar('file_hash', { length: 64 }),

    // Upload Details
    uploaded_by: varchar('uploaded_by', { length: 50 }).notNull(),
    upload_timestamp: timestamp('upload_timestamp').defaultNow().notNull(),
    upload_source: mysqlEnum('upload_source', [
      'Manual',
      'Gong',
      'Chorus',
      'API',
    ]).default('Manual'),

    // Processing Status
    processing_status: mysqlEnum('processing_status', [
      'Uploaded',
      'Processing',
      'Completed',
      'Failed',
    ]).default('Uploaded'),
    processed_at: timestamp('processed_at'),

    // Audit Fields
    created_at: timestamp('created_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    merchantIdx: index('idx_merchant').on(table.merchant_id),
    callDateIdx: index('idx_call_date').on(table.call_date),
    processingStatusIdx: index('idx_processing_status').on(
      table.processing_status
    ),
    uploadedByIdx: index('idx_uploaded_by').on(table.uploaded_by),
  })
);

// Type exports
export type CallTranscription = typeof callTranscriptions.$inferSelect;
export type NewCallTranscription = typeof callTranscriptions.$inferInsert;
