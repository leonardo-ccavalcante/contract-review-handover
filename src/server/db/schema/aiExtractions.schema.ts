import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  decimal,
  boolean,
  json,
  index,
} from 'drizzle-orm/mysql-core';

export const aiExtractions = mysqlTable(
  'ai_extractions',
  {
    extraction_id: varchar('extraction_id', { length: 50 }).primaryKey(),
    call_id: varchar('call_id', { length: 50 }).notNull().unique(),
    merchant_id: varchar('merchant_id', { length: 50 }).notNull(),
    extracted_at: timestamp('extracted_at').defaultNow().notNull(),
    ai_model: varchar('ai_model', { length: 50 }).notNull(),
    ai_model_version: varchar('ai_model_version', { length: 20 }),
    processing_time_ms: int('processing_time_ms'),

    // Overall Confidence (0-100)
    confidence_score_overall: decimal('confidence_score_overall', {
      precision: 5,
      scale: 2,
    }).notNull(),

    // Contract Terms (JSON with per-field confidence)
    contract_terms: json('contract_terms')
      .$type<{
        [key: string]: { value: any; confidence: number };
      }>()
      .notNull(),
    business_context: json('business_context')
      .$type<{
        [key: string]: { value: any; confidence: number } | any;
      }>()
      .notNull(),
    owner_profile: json('owner_profile').$type<Record<string, any>>(),
    market_intelligence: json('market_intelligence').$type<Record<string, any>>(),

    // Flags
    requires_manual_review: boolean('requires_manual_review').default(false),
    low_confidence_fields: json('low_confidence_fields').$type<string[]>(),

    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    confidenceIdx: index('idx_confidence').on(table.confidence_score_overall),
    manualReviewIdx: index('idx_manual_review').on(table.requires_manual_review),
    extractedAtIdx: index('idx_extracted_at').on(table.extracted_at),
    merchantIdx: index('idx_merchant').on(table.merchant_id),
  })
);

export type AIExtraction = typeof aiExtractions.$inferSelect;
export type NewAIExtraction = typeof aiExtractions.$inferInsert;
