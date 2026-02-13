-- ============================================================
-- Phase 7 & 8: Dashboard, Admin Panel & Notifications
-- Migration: 0004_dashboard_admin.sql
-- ============================================================

-- ── Exception Log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exception_log (
  exception_id      VARCHAR(50)   NOT NULL,
  exception_type    VARCHAR(100)  NOT NULL,
  severity          ENUM('P1','P2','P3','P4') NOT NULL DEFAULT 'P2',
  status            ENUM('OPEN','IN_PROGRESS','RESOLVED','IGNORED') NOT NULL DEFAULT 'OPEN',
  merchant_id       VARCHAR(50)   NULL,
  workflow_step     VARCHAR(100)  NULL,
  error_message     TEXT          NOT NULL,
  stack_trace       TEXT          NULL,
  context_data      JSON          NULL,
  resolved_by       VARCHAR(100)  NULL,
  resolved_at       TIMESTAMP     NULL,
  resolution_notes  TEXT          NULL,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (exception_id),
  INDEX idx_el_status    (status),
  INDEX idx_el_severity  (severity),
  INDEX idx_el_created   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Notifications ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  notification_id   VARCHAR(50)   NOT NULL,
  recipient_id      VARCHAR(100)  NOT NULL,
  recipient_role    VARCHAR(50)   NULL,
  notification_type ENUM(
    'VALIDATION_FAILED','VALIDATION_PASSED','MANUAL_REVIEW_REQUIRED',
    'OVERRIDE_REQUESTED','OVERRIDE_APPROVED','AUDIT_DISCREPANCY',
    'AUDIT_RESOLVED','PROFILE_CREATED','PROFILE_UPDATED','SYSTEM_ALERT'
  ) NOT NULL,
  title             VARCHAR(255)  NOT NULL,
  message           TEXT          NOT NULL,
  entity_type       VARCHAR(50)   NULL,
  entity_id         VARCHAR(50)   NULL,
  action_url        VARCHAR(500)  NULL,
  is_read           BOOLEAN       NOT NULL DEFAULT FALSE,
  read_at           TIMESTAMP     NULL,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  INDEX idx_notif_recipient  (recipient_id),
  INDEX idx_notif_unread     (recipient_id, is_read),
  INDEX idx_notif_created    (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id     VARCHAR(50)  NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  name        VARCHAR(255) NOT NULL,
  role        ENUM('Admin','Sales Manager','Regional Director','Sales Ops','Account Manager') NOT NULL DEFAULT 'Account Manager',
  team        VARCHAR(100) NULL,
  region      VARCHAR(100) NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login  TIMESTAMP    NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  INDEX idx_users_role      (role),
  INDEX idx_users_active    (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── System Settings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key   VARCHAR(100) NOT NULL,
  setting_value TEXT         NOT NULL,
  setting_type  VARCHAR(20)  NOT NULL DEFAULT 'string',
  description   TEXT         NULL,
  updated_by    VARCHAR(100) NULL,
  updated_at    TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Validation Rules Config ────────────────────────────────────
CREATE TABLE IF NOT EXISTS validation_rules (
  rule_id                 VARCHAR(50) NOT NULL,
  rule_name               VARCHAR(100) NOT NULL,
  confidence_threshold    INT          NOT NULL DEFAULT 90,
  mandatory_fields        JSON         NOT NULL,
  override_min_chars      INT          NOT NULL DEFAULT 50,
  sales_ops_sla_hours     INT          NOT NULL DEFAULT 2,
  is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
  updated_by              VARCHAR(100) NULL,
  notes                   TEXT         NULL,
  updated_at              TIMESTAMP    NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default validation rules
INSERT IGNORE INTO validation_rules (rule_id, rule_name, confidence_threshold, mandatory_fields, override_min_chars, sales_ops_sla_hours, is_active)
VALUES (
  'default-rules-v1',
  'Default Validation Rules',
  90,
  '["merchant_name","commission_percentage","campaign_type","campaign_duration","tablet_included","contract_length","merchant_goals","competitors"]',
  50,
  2,
  TRUE
);
