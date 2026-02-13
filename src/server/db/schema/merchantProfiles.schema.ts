import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  decimal,
  boolean,
  json,
  index,
  mysqlEnum,
  text,
} from 'drizzle-orm/mysql-core';

export const merchants = mysqlTable(
  'merchant_profiles',
  {
    profile_id: varchar('profile_id', { length: 50 }).primaryKey(),
    merchant_id: varchar('merchant_id', { length: 50 }).notNull(),
    source_call_id: varchar('source_call_id', { length: 50 }).notNull(),
    source_extraction_id: varchar('source_extraction_id', { length: 50 }).notNull(),

    // Versioning
    profile_version: int('profile_version').notNull().default(1),
    created_at: timestamp('created_at').defaultNow().notNull(),
    superseded_by: varchar('superseded_by', { length: 50 }),
    is_current_version: boolean('is_current_version').default(true),

    // Contract Terms (Denormalized)
    commission: varchar('commission', { length: 20 }),
    campaign_type: varchar('campaign_type', { length: 255 }),
    campaign_duration: int('campaign_duration'),
    tablet_included: boolean('tablet_included'),
    tablet_model: varchar('tablet_model', { length: 50 }),
    contract_length: int('contract_length'),

    // Business Context
    current_revenue_estimate: decimal('current_revenue_estimate', {
      precision: 12,
      scale: 2,
    }),
    employee_count: int('employee_count'),
    competitors_active: json('competitors_active').$type<string[]>(),
    merchant_goals: json('merchant_goals').$type<string[]>(),
    expected_order_volume: varchar('expected_order_volume', { length: 50 }),
    expansion_plans: varchar('expansion_plans', { length: 1000 }),

    // Owner Profile
    owner_personality: json('owner_personality').$type<Record<string, any>>(),
    owner_motivations: json('owner_motivations').$type<string[]>(),
    owner_concerns: json('owner_concerns').$type<string[]>(),
    decision_triggers: json('decision_triggers').$type<string[]>(),

    // Market Intelligence
    price_sensitivity: mysqlEnum('price_sensitivity', ['Low', 'Medium', 'High']),

    // AI Metadata
    extraction_confidence: decimal('extraction_confidence', { precision: 5, scale: 2 }),
    extraction_date: timestamp('extraction_date'),
    human_review_required: boolean('human_review_required').default(false),
    human_reviewed_by: varchar('human_reviewed_by', { length: 50 }),
    human_reviewed_at: timestamp('human_reviewed_at'),

    created_by: varchar('created_by', { length: 50 }),

    // Phase 6: Profile management fields
    ai_summary: text('ai_summary'),
    update_notes: varchar('update_notes', { length: 500 }),
    updated_by: varchar('updated_by', { length: 100 }),
    updated_at: timestamp('updated_at'),
  },
  (table) => ({
    merchantIdx: index('idx_merchant').on(table.merchant_id),
    currentVersionIdx: index('idx_current_version').on(table.is_current_version),
    humanReviewIdx: index('idx_human_review').on(table.human_review_required),
  })
);

export type MerchantProfile = typeof merchants.$inferSelect;
export type NewMerchantProfile = typeof merchants.$inferInsert;

// Named alias to avoid conflict with merchants.schema.ts
export const merchantProfiles = merchants;
