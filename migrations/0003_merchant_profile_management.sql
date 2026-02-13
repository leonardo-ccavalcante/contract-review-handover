-- ============================================================
-- Phase 6: Merchant Profile Management
-- Migration: 0003_merchant_profile_management.sql
-- ============================================================

-- Add Phase 6 columns to existing merchant_profiles table
ALTER TABLE merchant_profiles
  ADD COLUMN ai_summary         TEXT             NULL AFTER created_by,
  ADD COLUMN update_notes       VARCHAR(500)     NULL AFTER ai_summary,
  ADD COLUMN updated_by         VARCHAR(100)     NULL AFTER update_notes,
  ADD COLUMN updated_at         TIMESTAMP        NULL AFTER updated_by;

-- ============================================================
-- Profile Activity Log table
-- Tracks all changes to merchant profiles (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS profile_activity_log (
  activity_id          VARCHAR(50)   NOT NULL,
  profile_id           VARCHAR(50)   NOT NULL,
  merchant_id          VARCHAR(50)   NOT NULL,

  activity_type        ENUM(
                         'CREATED',
                         'UPDATED',
                         'VERSION_SUPERSEDED',
                         'REVIEWED',
                         'SUMMARY_GENERATED',
                         'FIELD_CORRECTED'
                       )             NOT NULL,

  performed_by         VARCHAR(100)  NOT NULL,
  performed_by_role    VARCHAR(50)   NULL,

  changed_fields       JSON          NULL COMMENT 'Array of {field, old_value, new_value}',
  notes                TEXT          NULL,
  new_profile_version  VARCHAR(50)   NULL COMMENT 'New profile_id created (if version bump)',

  created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (activity_id),
  INDEX idx_pal_profile      (profile_id),
  INDEX idx_pal_merchant     (merchant_id),
  INDEX idx_pal_activity_type (activity_type),
  INDEX idx_pal_created_at   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Useful indexes on merchant_profiles for Phase 6 search
-- ============================================================
CREATE INDEX idx_mp_price_sensitivity ON merchant_profiles (price_sensitivity);
CREATE INDEX idx_mp_extraction_confidence ON merchant_profiles (extraction_confidence);
CREATE INDEX idx_mp_updated_at ON merchant_profiles (updated_at);
