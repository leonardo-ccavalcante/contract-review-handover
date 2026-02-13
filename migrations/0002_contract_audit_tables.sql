-- Phase 5: Contract Auditor System Tables Migration
-- Based on manus-im-database-schema.md specifications (DT-002)

-- Merchants Table (core table referenced by all Phase 5 tables)
CREATE TABLE IF NOT EXISTS merchants (
    merchant_id             VARCHAR(50) PRIMARY KEY,
    merchant_name           VARCHAR(255) NOT NULL,
    merchant_legal_name     VARCHAR(255),
    cuisine_type            VARCHAR(100),
    neighborhood            VARCHAR(100),
    city                    VARCHAR(100),
    country                 VARCHAR(50),
    phone                   VARCHAR(50),
    email                   VARCHAR(255),
    segment                 ENUM('SMB', 'Mid-Market', 'Enterprise') NOT NULL,
    estimated_revenue       DECIMAL(12, 2),
    employee_count          INT,
    location_count          INT DEFAULT 1,
    assigned_am_id          VARCHAR(50),
    sales_manager_id        VARCHAR(50),
    merchant_status         ENUM('Prospecting', 'Negotiating', 'Closed Won', 'Active', 'Churned') NOT NULL,
    go_live_date            TIMESTAMP NULL,
    churn_date              TIMESTAMP NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              VARCHAR(50),
    updated_by              VARCHAR(50),
    deleted_at              TIMESTAMP NULL,

    INDEX idx_segment (segment),
    INDEX idx_status (merchant_status),
    INDEX idx_assigned_am (assigned_am_id),
    INDEX idx_go_live_date (go_live_date),
    INDEX idx_deleted_at (deleted_at)
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    contract_id             VARCHAR(50) PRIMARY KEY,
    merchant_id             VARCHAR(50) NOT NULL,
    source_extraction_id    VARCHAR(50),
    contract_status         ENUM('Draft', 'Sent', 'Signed', 'Active', 'Expired', 'Terminated') NOT NULL,
    signed_at               TIMESTAMP NULL,
    effective_date          DATE,
    expiration_date         DATE,
    go_live_date            TIMESTAMP NULL,
    pdf_url                 VARCHAR(512),
    pdf_storage_path        VARCHAR(512),
    pdf_hash                VARCHAR(64),
    commission              VARCHAR(20),
    campaign_type           VARCHAR(255),
    campaign_duration       INT,
    tablet_terms            TEXT,
    contract_length         INT,
    special_clauses         TEXT,
    merchant_signature_date TIMESTAMP NULL,
    bolt_signature_date     TIMESTAMP NULL,
    signed_via              ENUM('DocuSign', 'PandaDoc', 'Manual', 'API') DEFAULT 'DocuSign',
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              VARCHAR(50),

    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id),

    INDEX idx_merchant (merchant_id),
    INDEX idx_status (contract_status),
    INDEX idx_signed_at (signed_at),
    INDEX idx_go_live_date (go_live_date)
);

-- Contract Audit Log Table (DT-002 output)
CREATE TABLE IF NOT EXISTS contract_audit_log (
    audit_id                VARCHAR(50) PRIMARY KEY,
    contract_id             VARCHAR(50) NOT NULL,
    merchant_id             VARCHAR(50) NOT NULL,
    source_call_id          VARCHAR(50),

    -- Audit Details
    audit_timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    audited_by              ENUM('AI', 'Human') DEFAULT 'AI',
    ai_model                VARCHAR(50),

    -- Results
    discrepancies_found     BOOLEAN NOT NULL,
    discrepancy_count       INT DEFAULT 0,

    -- Discrepancy Details (JSON Array)
    -- Each element: { field, verbal_promise, contract_term, call_timestamp, severity, impact }
    discrepancies           JSON,

    -- Routing
    action_required         ENUM('NONE', 'SALES_OPS_REVIEW', 'URGENT_ESCALATION') NOT NULL,
    blocks_go_live          BOOLEAN DEFAULT FALSE,
    sla_hours               INT,

    -- Resolution
    resolution_status       ENUM('Pending', 'In Progress', 'Resolved', 'Accepted Risk') DEFAULT 'Pending',
    resolved_by             VARCHAR(50),
    resolved_at             TIMESTAMP NULL,
    resolution_notes        TEXT,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (contract_id) REFERENCES contracts(contract_id),
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id),

    INDEX idx_contract (contract_id),
    INDEX idx_merchant (merchant_id),
    INDEX idx_discrepancies_found (discrepancies_found),
    INDEX idx_resolution_status (resolution_status),
    INDEX idx_audit_timestamp (audit_timestamp)
);

-- Performance optimization indexes
CREATE INDEX idx_audit_merchant_resolution ON contract_audit_log(merchant_id, resolution_status);
CREATE INDEX idx_audit_timestamp_desc ON contract_audit_log(audit_timestamp DESC);
CREATE INDEX idx_contracts_merchant_status ON contracts(merchant_id, contract_status);

-- Comments for documentation
ALTER TABLE contracts COMMENT = 'Stores signed contract documents and metadata';
ALTER TABLE contract_audit_log COMMENT = 'Tracks contract-call discrepancies found by AI auditor (DT-002)';
ALTER TABLE merchants COMMENT = 'Central table storing all merchant information';
