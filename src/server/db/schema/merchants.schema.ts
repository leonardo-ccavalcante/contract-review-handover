import {
  mysqlTable,
  varchar,
  timestamp,
  mysqlEnum,
  decimal,
  int,
  index,
} from 'drizzle-orm/mysql-core';

// Merchants - central table storing all merchant information
export const merchants = mysqlTable(
  'merchants',
  {
    // Primary Key
    merchant_id: varchar('merchant_id', { length: 50 }).primaryKey(),

    // Basic Information
    merchant_name: varchar('merchant_name', { length: 255 }).notNull(),
    merchant_legal_name: varchar('merchant_legal_name', { length: 255 }),
    cuisine_type: varchar('cuisine_type', { length: 100 }),
    neighborhood: varchar('neighborhood', { length: 100 }),
    city: varchar('city', { length: 100 }),
    country: varchar('country', { length: 50 }),
    phone: varchar('phone', { length: 50 }),
    email: varchar('email', { length: 255 }),

    // Segmentation
    segment: mysqlEnum('segment', ['SMB', 'Mid-Market', 'Enterprise']).notNull(),
    estimated_revenue: decimal('estimated_revenue', { precision: 12, scale: 2 }),
    employee_count: int('employee_count'),
    location_count: int('location_count').default(1),

    // Relationships
    assigned_am_id: varchar('assigned_am_id', { length: 50 }),
    sales_manager_id: varchar('sales_manager_id', { length: 50 }),

    // Status
    merchant_status: mysqlEnum('merchant_status', [
      'Prospecting',
      'Negotiating',
      'Closed Won',
      'Active',
      'Churned',
    ]).notNull(),
    go_live_date: timestamp('go_live_date'),
    churn_date: timestamp('churn_date'),

    // Audit Fields
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at')
      .defaultNow()
      .onUpdateNow()
      .notNull(),
    created_by: varchar('created_by', { length: 50 }),
    updated_by: varchar('updated_by', { length: 50 }),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    segmentIdx: index('idx_segment').on(table.segment),
    statusIdx: index('idx_status').on(table.merchant_status),
    assignedAmIdx: index('idx_assigned_am').on(table.assigned_am_id),
    goLiveDateIdx: index('idx_go_live_date').on(table.go_live_date),
    deletedAtIdx: index('idx_deleted_at').on(table.deleted_at),
  })
);

// Type exports
export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
