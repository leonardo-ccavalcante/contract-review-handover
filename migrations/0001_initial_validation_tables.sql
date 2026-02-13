-- Initial Database Migration for Pre-Contract Validation System (Hard Gate #1)
-- Based on manus-im-database-schema.md specifications

-- AI Extractions Table
CREATE TABLE IF NOT EXISTS ai_extractions (
    extraction_id           VARCHAR(50) PRIMARY KEY,
    call_id                 VARCHAR(50) NOT NULL UNIQUE,
    merchant_id             VARCHAR(50) NOT NULL,
    extracted_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ai_model                VARCHAR(50) NOT NULL,
    ai_model_version        VARCHAR(20),
    processing_time_ms      INT,

    -- Overall Confidence (0-100)
    confidence_score_overall DECIMAL(5, 2) NOT NULL,

    -- Contract Terms (JSON with per-field confidence)
    contract_terms          JSON NOT NULL,
    business_context        JSON NOT NULL,
    owner_profile           JSON,
    market_intelligence     JSON,

    -- Flags
    requires_manual_review  BOOLEAN DEFAULT FALSE,
    low_confidence_fields   JSON,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Indexes
    INDEX idx_confidence (confidence_score_overall),
    INDEX idx_manual_review (requires_manual_review),
    INDEX idx_extracted_at (extracted_at),
    INDEX idx_merchant (merchant_id)
);

-- Validation Log Table
CREATE TABLE IF NOT EXISTS validation_log (
    validation_id           VARCHAR(50) PRIMARY KEY,
    extraction_id           VARCHAR(50) NOT NULL,
    merchant_id             VARCHAR(50) NOT NULL,

    -- Validation Results
    validation_status       ENUM('PASS', 'FAIL', 'MANUAL_REVIEW', 'OVERRIDE') NOT NULL,
    validation_timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Validation Details
    mandatory_fields_complete BOOLEAN NOT NULL,
    ai_confidence_threshold_met BOOLEAN NOT NULL,
    missing_fields          JSON,
    low_confidence_fields   JSON,

    -- Routing
    next_action             ENUM('PROCEED_TO_CONTRACT', 'ROUTE_TO_SALES_OPS', 'BLOCK', 'GENERATE_RETRY_INTEL') NOT NULL,
    blocking_reasons        JSON,

    -- Override Details (if applicable)
    override_by             VARCHAR(50),
    override_justification  VARCHAR(1000),
    override_timestamp      TIMESTAMP NULL,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Foreign Keys
    FOREIGN KEY (extraction_id) REFERENCES ai_extractions(extraction_id),

    -- Indexes
    INDEX idx_status (validation_status),
    INDEX idx_timestamp (validation_timestamp),
    INDEX idx_merchant (merchant_id),
    INDEX idx_next_action (next_action)
);

-- Merchant Profiles Table
CREATE TABLE IF NOT EXISTS merchant_profiles (
    profile_id              VARCHAR(50) PRIMARY KEY,
    merchant_id             VARCHAR(50) NOT NULL,
    source_call_id          VARCHAR(50) NOT NULL,
    source_extraction_id    VARCHAR(50) NOT NULL,

    -- Versioning
    profile_version         INT NOT NULL DEFAULT 1,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    superseded_by           VARCHAR(50) NULL,
    is_current_version      BOOLEAN DEFAULT TRUE,

    -- Contract Terms (Denormalized for quick access)
    commission              VARCHAR(20),
    campaign_type           VARCHAR(255),
    campaign_duration       INT,
    tablet_included         BOOLEAN,
    tablet_model            VARCHAR(50),
    contract_length         INT,

    -- Business Context
    current_revenue_estimate DECIMAL(12, 2),
    employee_count          INT,
    competitors_active      JSON,
    merchant_goals          JSON,
    expected_order_volume   VARCHAR(50),
    expansion_plans         VARCHAR(1000),

    -- Owner Profile
    owner_personality       JSON,
    owner_motivations       JSON,
    owner_concerns          JSON,
    decision_triggers       JSON,

    -- Market Intelligence
    price_sensitivity       ENUM('Low', 'Medium', 'High'),

    -- AI Metadata
    extraction_confidence   DECIMAL(5, 2),
    extraction_date         TIMESTAMP,
    human_review_required   BOOLEAN DEFAULT FALSE,
    human_reviewed_by       VARCHAR(50),
    human_reviewed_at       TIMESTAMP NULL,

    created_by              VARCHAR(50),

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_current_version (is_current_version),
    INDEX idx_human_review (human_review_required)
);

-- Insert sample data for testing (optional)
-- Uncomment below for development/testing

/*
INSERT INTO ai_extractions (
    extraction_id, call_id, merchant_id, ai_model,
    confidence_score_overall, contract_terms, business_context
) VALUES (
    'test-extraction-1',
    'test-call-1',
    'merchant-001',
    'claude-3-5-sonnet',
    95.5,
    '{
        "merchant_name": {"value": "Pizza Palace", "confidence": 100},
        "commission_percentage": {"value": "12%", "confidence": 98},
        "campaign_type": {"value": "15% discount", "confidence": 95},
        "campaign_duration": {"value": 60, "confidence": 92},
        "tablet_included": {"value": true, "confidence": 100},
        "contract_length": {"value": 12, "confidence": 95}
    }',
    '{
        "merchant_goals": ["Increase weekend orders", "Reach new customers"],
        "competitors": ["UberEats", "Glovo"]
    }'
);
*/

-- Performance optimization indexes
CREATE INDEX idx_validations_created_at ON validation_log(created_at DESC);
CREATE INDEX idx_extractions_created_at ON ai_extractions(created_at DESC);
CREATE INDEX idx_validation_merchant_status ON validation_log(merchant_id, validation_status);

-- Comments for documentation
ALTER TABLE validation_log COMMENT = 'Stores validation results for Hard Gate #1 (DT-001)';
ALTER TABLE ai_extractions COMMENT = 'AI-extracted merchant data from sales call transcriptions';
ALTER TABLE merchant_profiles COMMENT = 'Versioned merchant profiles with denormalized data';
