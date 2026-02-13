# MANUS IM IMPLEMENTATION - DATABASE SCHEMA

**Project:** Bolt Food Sales → AM Handover Automation
**Purpose:** Complete database schema with table relationships
**Date:** 2026-02-12
**Version:** 1.0

---

## TABLE OF CONTENTS

1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [Table Definitions](#table-definitions)
3. [Relationship Matrix](#relationship-matrix)
4. [Indexes & Performance](#indexes--performance)
5. [Data Retention & Archival](#data-retention--archival)

---

## ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CORE ENTITIES                                   │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   merchants     │
                    │─────────────────│
                    │ merchant_id (PK)│
                    │ merchant_name   │
                    │ segment         │
                    │ assigned_am_id  │──┐
                    │ created_at      │  │
                    └────────┬────────┘  │
                             │           │
                ┌────────────┼───────────┼─────────────┐
                │            │           │             │
                │            │           │             │
┌───────────────▼──┐  ┌──────▼──────┐  │  ┌──────────▼────────┐
│ call_transcriptions│  │ merchant_  │  │  │ handover_log      │
│──────────────────│  │ profiles    │  │  │───────────────────│
│ call_id (PK)     │  │─────────────│  │  │ handover_id (PK)  │
│ merchant_id (FK) │  │ profile_id  │  │  │ merchant_id (FK)  │
│ transcription_   │  │   (PK)      │  │  │ handover_status   │
│   text           │  │ merchant_id │  │  │ billing_config_id │
│ uploaded_by      │  │   (FK)      │  │  │ campaign_id       │
│ upload_timestamp │  │ source_call │  │  │ tablet_id         │
└─────────┬────────┘  │   _id (FK)  │  │  │ completed_at      │
          │           │ contract_   │  │  └───────────────────┘
          │           │   terms     │  │
          │           │ business_   │  │
          │           │   context   │  │
          │           │ owner_      │  │
          │           │   profile   │  │
          │           │ market_     │  │
          │           │   intel     │  │
          │           └──────┬──────┘  │
          │                  │         │
┌─────────▼────────┐  ┌──────▼─────┐  │
│ ai_extractions   │  │ contracts  │  │
│──────────────────│  │────────────│  │
│ extraction_id    │  │ contract_  │  │
│   (PK)           │  │   id (PK)  │  │
│ call_id (FK)     │  │ merchant_  │  │
│ extracted_at     │  │   id (FK)  │  │
│ confidence_score │  │ signed_at  │  │
│ contract_terms   │  │ go_live_   │  │
│ business_context │  │   date     │  │
│ owner_profile    │  │ pdf_url    │  │
│ market_intel     │  └──────┬─────┘  │
└─────────┬────────┘         │        │
          │                  │        │
          │           ┌──────▼──────┐ │
          │           │ contract_   │ │
          │           │ audit_log   │ │
          │           │─────────────│ │
          │           │ audit_id    │ │
          │           │   (PK)      │ │
          │           │ contract_id │ │
          │           │   (FK)      │ │
          │           │ discrepancies│ │
          │           │   _found    │ │
          │           │ discrepancy │ │
          │           │   _details  │ │
          │           └─────────────┘ │
          │                           │
┌─────────▼────────┐                  │
│ validation_log   │                  │
│──────────────────│                  │
│ validation_id    │                  │
│   (PK)           │                  │
│ extraction_id    │                  │
│   (FK)           │                  │
│ validation_      │                  │
│   status         │                  │
│ blocking_reasons │                  │
│ validated_at     │                  │
└──────────────────┘                  │
                                      │
┌─────────────────────────────────────┘
│
│  ┌──────────────────┐
│  │ account_managers │
└─>│──────────────────│
   │ am_id (PK)       │
   │ am_name          │
   │ email            │
   │ slack_user_id    │
   └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        MONITORING & ANALYTICS                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│ order_events     │         │ tt21_monitoring  │
│──────────────────│         │──────────────────│
│ order_id (PK)    │         │ monitor_id (PK)  │
│ merchant_id (FK) │────────>│ merchant_id (FK) │
│ order_timestamp  │         │ days_since_go_   │
│ order_number     │         │   live           │
│ order_value      │         │ current_order_   │
└──────────────────┘         │   count          │
                             │ status           │
                             │ last_check_at    │
                             └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      EXCEPTION & COMMUNICATION                           │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│ exception_log    │         │ partner_         │
│──────────────────│         │ communications   │
│ exception_id     │         │──────────────────│
│   (PK)           │         │ communication_id │
│ merchant_id (FK) │         │   (PK)           │
│ exception_type   │         │ merchant_id (FK) │
│ severity         │         │ channel          │
│ error_message    │         │ message_sent_at  │
│ assigned_to      │         │ delivery_status  │
│ resolution_      │         │ template_id      │
│   status         │         └──────────────────┘
│ created_at       │
│ resolved_at      │
└──────────────────┘

┌──────────────────┐
│ intervention_log │
│──────────────────│
│ intervention_id  │
│   (PK)           │
│ merchant_id (FK) │
│ trigger_reason   │
│ am_notified_at   │
│ action_taken     │
│ outcome          │
└──────────────────┘
```

---

## TABLE DEFINITIONS

### Core Tables

---

#### 1. `merchants`

**Purpose:** Central table storing all merchant information

```sql
CREATE TABLE merchants (
    -- Primary Key
    merchant_id             VARCHAR(50) PRIMARY KEY,

    -- Basic Information
    merchant_name           VARCHAR(255) NOT NULL,
    merchant_legal_name     VARCHAR(255),
    cuisine_type            VARCHAR(100),
    neighborhood            VARCHAR(100),
    city                    VARCHAR(100),
    country                 VARCHAR(50),
    phone                   VARCHAR(50),
    email                   VARCHAR(255),

    -- Segmentation
    segment                 ENUM('SMB', 'Mid-Market', 'Enterprise') NOT NULL,
    estimated_revenue       DECIMAL(12, 2),
    employee_count          INT,
    location_count          INT DEFAULT 1,

    -- Relationships
    assigned_am_id          VARCHAR(50),
    sales_manager_id        VARCHAR(50),

    -- Status
    merchant_status         ENUM('Prospecting', 'Negotiating', 'Closed Won', 'Active', 'Churned') NOT NULL,
    go_live_date            TIMESTAMP,
    churn_date              TIMESTAMP,

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              VARCHAR(50),
    updated_by              VARCHAR(50),
    deleted_at              TIMESTAMP NULL,

    -- Foreign Keys
    FOREIGN KEY (assigned_am_id) REFERENCES account_managers(am_id),
    FOREIGN KEY (sales_manager_id) REFERENCES sales_managers(sm_id),

    -- Indexes
    INDEX idx_segment (segment),
    INDEX idx_status (merchant_status),
    INDEX idx_assigned_am (assigned_am_id),
    INDEX idx_go_live_date (go_live_date),
    INDEX idx_deleted_at (deleted_at)
);
```

**Sample Data:**
```json
{
  "merchant_id": "M-12345",
  "merchant_name": "Pizzaria do Bairro",
  "merchant_legal_name": "Pizzaria do Bairro Ltda",
  "cuisine_type": "Italian/Pizza",
  "neighborhood": "Bay Ridge",
  "city": "Brooklyn",
  "country": "USA",
  "phone": "+1-718-555-0123",
  "email": "contato@pizzariadobairro.com",
  "segment": "SMB",
  "estimated_revenue": 350000.00,
  "employee_count": 8,
  "location_count": 1,
  "assigned_am_id": "AM-67890",
  "sales_manager_id": "SM-12345",
  "merchant_status": "Active",
  "go_live_date": "2026-02-15T14:00:00Z",
  "created_at": "2026-02-10T10:30:00Z"
}
```

---

#### 2. `call_transcriptions`

**Purpose:** Store raw call transcriptions from sales conversations

```sql
CREATE TABLE call_transcriptions (
    -- Primary Key
    call_id                 VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    merchant_id             VARCHAR(50) NOT NULL,
    sales_manager_id        VARCHAR(50) NOT NULL,

    -- Call Details
    call_date               DATE NOT NULL,
    call_duration_minutes   INT,
    call_type               ENUM('Discovery', 'Negotiation', 'Closing', 'Follow-up') NOT NULL,

    -- Transcription Content
    transcription_text      LONGTEXT NOT NULL,
    transcription_format    ENUM('txt', 'json', 'srt') DEFAULT 'txt',

    -- File Metadata
    file_size_bytes         BIGINT,
    file_hash               VARCHAR(64),

    -- Upload Details
    uploaded_by             VARCHAR(50) NOT NULL,
    upload_timestamp        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upload_source           ENUM('Manual', 'Gong', 'Chorus', 'API') DEFAULT 'Manual',

    -- Processing Status
    processing_status       ENUM('Uploaded', 'Processing', 'Completed', 'Failed') DEFAULT 'Uploaded',
    processed_at            TIMESTAMP NULL,

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP NULL,

    -- Foreign Keys
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    FOREIGN KEY (sales_manager_id) REFERENCES sales_managers(sm_id),

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_call_date (call_date),
    INDEX idx_processing_status (processing_status),
    INDEX idx_uploaded_by (uploaded_by)
);
```

---

#### 3. `ai_extractions`

**Purpose:** Store AI-extracted structured data from call transcriptions

```sql
CREATE TABLE ai_extractions (
    -- Primary Key
    extraction_id           VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    call_id                 VARCHAR(50) NOT NULL UNIQUE,
    merchant_id             VARCHAR(50) NOT NULL,

    -- Extraction Metadata
    extracted_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_model                VARCHAR(50) NOT NULL,
    ai_model_version        VARCHAR(20),
    processing_time_ms      INT,

    -- Overall Confidence
    confidence_score_overall DECIMAL(5, 2) NOT NULL,

    -- Contract Terms (JSON)
    contract_terms          JSON NOT NULL,
    /*
    {
      "commission": {"value": "12%", "confidence": 98},
      "campaign_type": {"value": "15% discount for 60 days", "confidence": 95},
      "tablet_included": {"value": true, "confidence": 100},
      "tablet_model": {"value": "T-200", "confidence": 95},
      "contract_length": {"value": "12 months", "confidence": 92}
    }
    */

    -- Business Context (JSON)
    business_context        JSON NOT NULL,
    /*
    {
      "current_revenue": {"value": "€350k/year estimate", "confidence": 75},
      "employee_count": {"value": 8, "confidence": 90},
      "competitors": {"value": ["UberEats", "Glovo"], "confidence": 90},
      "goals": {"value": ["Reach new customers", "Increase weekend orders"], "confidence": 88}
    }
    */

    -- Owner Profile (JSON)
    owner_profile           JSON NOT NULL,
    /*
    {
      "personality_traits": {"value": ["Growth-oriented", "Price-sensitive"], "confidence": 80},
      "main_concerns": {"value": ["Commission structure", "Delivery reliability"], "confidence": 92},
      "decision_triggers": {"value": ["Competitor delays", "Market share"], "confidence": 85}
    }
    */

    -- Market Intelligence (JSON)
    market_intelligence     JSON NOT NULL,
    /*
    {
      "cuisine_type": {"value": "Italian/Pizza", "confidence": 100},
      "price_sensitivity": {"value": "High", "confidence": 78},
      "expansion_potential": {"value": "Considering 2nd location in 12 months", "confidence": 70}
    }
    */

    -- Flags
    requires_manual_review  BOOLEAN DEFAULT FALSE,
    low_confidence_fields   JSON,

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (call_id) REFERENCES call_transcriptions(call_id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_confidence (confidence_score_overall),
    INDEX idx_manual_review (requires_manual_review),
    INDEX idx_extracted_at (extracted_at)
);
```

---

#### 4. `validation_log`

**Purpose:** Track validation results from Hard Gate #1

```sql
CREATE TABLE validation_log (
    -- Primary Key
    validation_id           VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    extraction_id           VARCHAR(50) NOT NULL,
    merchant_id             VARCHAR(50) NOT NULL,

    -- Validation Results
    validation_status       ENUM('PASS', 'FAIL', 'MANUAL_REVIEW', 'OVERRIDE') NOT NULL,
    validation_timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
    override_justification  TEXT,
    override_timestamp      TIMESTAMP NULL,

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (extraction_id) REFERENCES ai_extractions(extraction_id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_status (validation_status),
    INDEX idx_timestamp (validation_timestamp)
);
```

---

#### 5. `merchant_profiles`

**Purpose:** Comprehensive structured merchant profile for AM/Success teams

```sql
CREATE TABLE merchant_profiles (
    -- Primary Key
    profile_id              VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    merchant_id             VARCHAR(50) NOT NULL,
    source_call_id          VARCHAR(50) NOT NULL,
    source_extraction_id    VARCHAR(50) NOT NULL,

    -- Versioning
    profile_version         INT NOT NULL DEFAULT 1,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    competitor_benefits     TEXT,
    merchant_goals          JSON,
    expected_order_volume   VARCHAR(50),
    expansion_plans         TEXT,

    -- Owner Profile
    owner_personality       JSON,
    owner_motivations       JSON,
    owner_concerns          JSON,
    decision_triggers       JSON,

    -- Market Intelligence
    price_sensitivity       ENUM('Low', 'Medium', 'High'),
    market_density          VARCHAR(50),
    competitive_positioning TEXT,

    -- AI Summary
    profile_summary         TEXT,

    -- AI Metadata
    extraction_confidence   DECIMAL(5, 2),
    extraction_date         TIMESTAMP,
    human_review_required   BOOLEAN DEFAULT FALSE,
    human_reviewed_by       VARCHAR(50),
    human_reviewed_at       TIMESTAMP NULL,

    -- Access Control
    created_by              VARCHAR(50),

    -- Foreign Keys
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    FOREIGN KEY (source_call_id) REFERENCES call_transcriptions(call_id),
    FOREIGN KEY (source_extraction_id) REFERENCES ai_extractions(extraction_id),
    FOREIGN KEY (superseded_by) REFERENCES merchant_profiles(profile_id),

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_current_version (is_current_version),
    INDEX idx_created_at (created_at),
    INDEX idx_source_call (source_call_id)
);
```

---

#### 6. `contracts`

**Purpose:** Store signed contract documents and metadata

```sql
CREATE TABLE contracts (
    -- Primary Key
    contract_id             VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    merchant_id             VARCHAR(50) NOT NULL,
    source_extraction_id    VARCHAR(50),

    -- Contract Details
    contract_status         ENUM('Draft', 'Sent', 'Signed', 'Active', 'Expired', 'Terminated') NOT NULL,
    signed_at               TIMESTAMP NULL,
    effective_date          DATE,
    expiration_date         DATE,
    go_live_date            TIMESTAMP,

    -- Document Storage
    pdf_url                 VARCHAR(512),
    pdf_storage_path        VARCHAR(512),
    pdf_hash                VARCHAR(64),

    -- Contract Terms (Extracted)
    commission              VARCHAR(20),
    campaign_type           VARCHAR(255),
    campaign_duration       INT,
    tablet_terms            TEXT,
    contract_length         INT,
    special_clauses         TEXT,

    -- Signatures
    merchant_signature_date TIMESTAMP,
    bolt_signature_date     TIMESTAMP,
    signed_via              ENUM('DocuSign', 'PandaDoc', 'Manual', 'API') DEFAULT 'DocuSign',

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              VARCHAR(50),

    -- Foreign Keys
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    FOREIGN KEY (source_extraction_id) REFERENCES ai_extractions(extraction_id),

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_status (contract_status),
    INDEX idx_signed_at (signed_at),
    INDEX idx_go_live_date (go_live_date)
);
```

---

#### 7. `contract_audit_log`

**Purpose:** Track contract-call discrepancies found by AI auditor

```sql
CREATE TABLE contract_audit_log (
    -- Primary Key
    audit_id                VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    contract_id             VARCHAR(50) NOT NULL,
    merchant_id             VARCHAR(50) NOT NULL,
    source_call_id          VARCHAR(50),

    -- Audit Details
    audit_timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audited_by              ENUM('AI', 'Human') DEFAULT 'AI',
    ai_model                VARCHAR(50),

    -- Results
    discrepancies_found     BOOLEAN NOT NULL,
    discrepancy_count       INT DEFAULT 0,

    -- Discrepancy Details (JSON Array)
    discrepancies           JSON,
    /*
    [
      {
        "field": "commission",
        "verbal_promise": "10% commission",
        "contract_term": "12% commission",
        "call_timestamp": "00:23:15",
        "severity": "HIGH",
        "impact": "Revenue discrepancy, likely escalation"
      }
    ]
    */

    -- Routing
    action_required         ENUM('NONE', 'SALES_OPS_REVIEW', 'URGENT_ESCALATION') NOT NULL,
    blocks_go_live          BOOLEAN DEFAULT FALSE,
    sla_hours               INT,

    -- Resolution
    resolution_status       ENUM('Pending', 'In Progress', 'Resolved', 'Accepted Risk') DEFAULT 'Pending',
    resolved_by             VARCHAR(50),
    resolved_at             TIMESTAMP NULL,
    resolution_notes        TEXT,

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    FOREIGN KEY (source_call_id) REFERENCES call_transcriptions(call_id),

    -- Indexes
    INDEX idx_contract (contract_id),
    INDEX idx_merchant (merchant_id),
    INDEX idx_discrepancies_found (discrepancies_found),
    INDEX idx_resolution_status (resolution_status),
    INDEX idx_audit_timestamp (audit_timestamp)
);
```

---

### Handover & Operations Tables

---

#### 8. `handover_log`

**Purpose:** Track automated handover execution and results

```sql
CREATE TABLE handover_log (
    -- Primary Key
    handover_id             VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    merchant_id             VARCHAR(50) NOT NULL,
    contract_id             VARCHAR(50) NOT NULL,
    assigned_am_id          VARCHAR(50) NOT NULL,

    -- Handover Details
    handover_type           ENUM('SMB_Auto', 'MM_Hybrid', 'Enterprise_Manual') NOT NULL,
    handover_status         ENUM('PENDING', 'IN_PROGRESS', 'COMPLETE', 'PARTIAL_SUCCESS', 'FAILED') NOT NULL,

    -- Execution Steps
    steps_completed         JSON,
    /*
    [
      "data_validation",
      "billing_configured",
      "campaign_scheduled",
      "tablet_queued",
      "dossier_generated",
      "am_notified"
    ]
    */

    -- API Integration IDs
    billing_config_id       VARCHAR(100),
    campaign_id             VARCHAR(100),
    tablet_id               VARCHAR(100),

    -- Handover Assets
    dossier_url             VARCHAR(512),
    dossier_generated_at    TIMESTAMP NULL,

    -- Timing
    started_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at            TIMESTAMP NULL,
    execution_time_seconds  INT,

    -- Errors (if any)
    error_count             INT DEFAULT 0,
    errors                  JSON,

    -- AM Notification
    am_notified             BOOLEAN DEFAULT FALSE,
    am_notified_at          TIMESTAMP NULL,
    notification_channels   JSON,

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_am_id) REFERENCES account_managers(am_id),

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_status (handover_status),
    INDEX idx_completed_at (completed_at),
    INDEX idx_am (assigned_am_id)
);
```

---

#### 9. `exception_log`

**Purpose:** Central log for all system exceptions and failures

```sql
CREATE TABLE exception_log (
    -- Primary Key
    exception_id            VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    merchant_id             VARCHAR(50),
    handover_id             VARCHAR(50),

    -- Exception Classification
    exception_type          ENUM(
                              'BILLING_ERROR',
                              'CAMPAIGN_FAILURE',
                              'MISSING_DATA',
                              'API_FAILURE',
                              'CONTRACT_DISCREPANCY',
                              'VALIDATION_FAILURE',
                              'OTHER'
                            ) NOT NULL,

    severity                ENUM('P0', 'P1', 'P2') NOT NULL,

    -- Exception Details
    error_message           TEXT NOT NULL,
    error_code              VARCHAR(50),
    workflow_step           VARCHAR(100),
    technical_details       JSON,

    -- Impact Assessment
    blocks_go_live          BOOLEAN DEFAULT FALSE,
    revenue_impact          BOOLEAN DEFAULT FALSE,
    partner_experience_impact BOOLEAN DEFAULT FALSE,

    -- Routing
    assigned_to             VARCHAR(50),
    assigned_team           ENUM('Finance Ops', 'Campaign Ops', 'Sales Ops', 'Engineering', 'AM Team'),
    sla_hours               INT NOT NULL,
    sla_deadline            TIMESTAMP NOT NULL,

    -- Resolution
    resolution_status       ENUM('Open', 'In Progress', 'Resolved', 'Cannot Reproduce', 'Accepted') DEFAULT 'Open',
    resolved_by             VARCHAR(50),
    resolved_at             TIMESTAMP NULL,
    resolution_notes        TEXT,
    root_cause              TEXT,
    root_cause_category     VARCHAR(100),

    -- Learning
    tagged_for_ai_training  BOOLEAN DEFAULT FALSE,
    prevention_implemented  BOOLEAN DEFAULT FALSE,

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE SET NULL,
    FOREIGN KEY (handover_id) REFERENCES handover_log(handover_id) ON DELETE SET NULL,

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_exception_type (exception_type),
    INDEX idx_severity (severity),
    INDEX idx_resolution_status (resolution_status),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_at (created_at),
    INDEX idx_sla_deadline (sla_deadline)
);
```

---

### Monitoring & Analytics Tables

---

#### 10. `order_events`

**Purpose:** Store order events for TT21 monitoring

```sql
CREATE TABLE order_events (
    -- Primary Key
    order_id                VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    merchant_id             VARCHAR(50) NOT NULL,

    -- Order Details
    order_number            INT NOT NULL,
    order_timestamp         TIMESTAMP NOT NULL,
    order_value             DECIMAL(10, 2),
    order_status            ENUM('Placed', 'Completed', 'Cancelled') NOT NULL,

    -- Metadata
    customer_id             VARCHAR(50),
    delivery_time_minutes   INT,

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_order_timestamp (order_timestamp),
    INDEX idx_order_number (merchant_id, order_number)
);
```

---

#### 11. `tt21_monitoring`

**Purpose:** Track TT21 progress for each merchant

```sql
CREATE TABLE tt21_monitoring (
    -- Primary Key
    monitor_id              VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    merchant_id             VARCHAR(50) NOT NULL UNIQUE,

    -- Progress Tracking
    go_live_date            DATE NOT NULL,
    days_since_go_live      INT NOT NULL,
    current_order_count     INT NOT NULL DEFAULT 0,
    orders_per_day_avg      DECIMAL(5, 2),

    -- Status
    status                  ENUM('ON_TRACK', 'AT_RISK', 'FAILED_TT21', 'ACHIEVED') NOT NULL,
    tt21_achieved           BOOLEAN DEFAULT FALSE,
    tt21_achieved_date      DATE NULL,
    actual_tt21_days        INT NULL,

    -- Intervention
    at_risk_flagged         BOOLEAN DEFAULT FALSE,
    at_risk_flagged_at      TIMESTAMP NULL,
    am_notified             BOOLEAN DEFAULT FALSE,
    am_notified_at          TIMESTAMP NULL,

    -- Calculated Fields
    expected_orders         INT,
    orders_behind           INT,
    daily_orders_needed     DECIMAL(5, 2),

    -- Audit Fields
    last_check_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_status (status),
    INDEX idx_go_live_date (go_live_date),
    INDEX idx_tt21_achieved (tt21_achieved)
);
```

---

#### 12. `intervention_log`

**Purpose:** Track AM interventions triggered by monitoring

```sql
CREATE TABLE intervention_log (
    -- Primary Key
    intervention_id         VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    merchant_id             VARCHAR(50) NOT NULL,
    assigned_am_id          VARCHAR(50) NOT NULL,

    -- Trigger
    trigger_reason          ENUM('TT21_At_Risk', 'TT21_Failed', 'Low_Orders', 'Manual') NOT NULL,
    trigger_timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Context
    days_since_go_live      INT,
    order_count_at_trigger  INT,
    suggested_actions       JSON,

    -- AM Actions
    am_notified_at          TIMESTAMP NULL,
    notification_channel    ENUM('Slack', 'Email', 'SMS', 'In-App') NOT NULL,

    action_taken            TEXT,
    action_taken_at         TIMESTAMP NULL,
    action_type             ENUM('Called Merchant', 'Menu Optimization', 'Pricing Review', 'Zone Expansion', 'Other'),

    -- Outcome
    outcome                 ENUM('Pending', 'Improved', 'No Change', 'Churned') DEFAULT 'Pending',
    outcome_recorded_at     TIMESTAMP NULL,
    outcome_notes           TEXT,

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_am_id) REFERENCES account_managers(am_id),

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_am (assigned_am_id),
    INDEX idx_trigger_reason (trigger_reason),
    INDEX idx_outcome (outcome),
    INDEX idx_trigger_timestamp (trigger_timestamp)
);
```

---

### Communication Tables

---

#### 13. `partner_communications`

**Purpose:** Log all automated communications sent to merchants

```sql
CREATE TABLE partner_communications (
    -- Primary Key
    communication_id        VARCHAR(50) PRIMARY KEY,

    -- Foreign Keys
    merchant_id             VARCHAR(50) NOT NULL,

    -- Communication Details
    channel                 ENUM('WhatsApp', 'SMS', 'Email', 'Phone') NOT NULL,
    communication_type      ENUM('Campaign_Confirmation', 'Milestone_Update', 'Intervention', 'Other') NOT NULL,
    template_id             VARCHAR(50),

    -- Message Content
    message_text            TEXT,
    message_personalization JSON,

    -- Sending
    sent_to                 VARCHAR(255) NOT NULL,
    message_sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Delivery Status
    delivery_status         ENUM('Queued', 'Sent', 'Delivered', 'Read', 'Failed') NOT NULL,
    delivered_at            TIMESTAMP NULL,
    read_at                 TIMESTAMP NULL,
    failure_reason          TEXT,

    -- Cost
    cost                    DECIMAL(6, 4),
    currency                VARCHAR(3) DEFAULT 'EUR',

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_merchant (merchant_id),
    INDEX idx_channel (channel),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_sent_at (message_sent_at)
);
```

---

### Supporting Tables

---

#### 14. `account_managers`

**Purpose:** AM team information

```sql
CREATE TABLE account_managers (
    -- Primary Key
    am_id                   VARCHAR(50) PRIMARY KEY,

    -- Basic Information
    am_name                 VARCHAR(255) NOT NULL,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    phone                   VARCHAR(50),
    slack_user_id           VARCHAR(50),

    -- Role
    role                    ENUM('AM', 'Senior AM', 'AM Team Lead') NOT NULL,
    region                  VARCHAR(100),

    -- Capacity
    current_merchant_count  INT DEFAULT 0,
    max_merchant_capacity   INT DEFAULT 50,

    -- Status
    status                  ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_email (email),
    INDEX idx_region (region),
    INDEX idx_status (status)
);
```

---

#### 15. `sales_managers`

**Purpose:** Sales team information

```sql
CREATE TABLE sales_managers (
    -- Primary Key
    sm_id                   VARCHAR(50) PRIMARY KEY,

    -- Basic Information
    sm_name                 VARCHAR(255) NOT NULL,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    phone                   VARCHAR(50),

    -- Role
    role                    ENUM('SDR', 'Sales Manager', 'Regional Sales Director') NOT NULL,
    territory               VARCHAR(100),

    -- Performance Tracking
    total_deals_closed      INT DEFAULT 0,
    clean_handover_score_avg DECIMAL(5, 2),

    -- Status
    status                  ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',

    -- Audit Fields
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_email (email),
    INDEX idx_territory (territory),
    INDEX idx_status (status)
);
```

---

## RELATIONSHIP MATRIX

| Table | Relationships |
|-------|--------------|
| **merchants** | • Parent to: call_transcriptions, ai_extractions, merchant_profiles, contracts, handover_log, tt21_monitoring<br>• FK to: account_managers (assigned_am_id), sales_managers (sales_manager_id) |
| **call_transcriptions** | • Child of: merchants<br>• Parent to: ai_extractions<br>• FK to: sales_managers |
| **ai_extractions** | • Child of: call_transcriptions, merchants<br>• Parent to: validation_log, merchant_profiles |
| **validation_log** | • Child of: ai_extractions, merchants |
| **merchant_profiles** | • Child of: merchants, call_transcriptions, ai_extractions<br>• Self-referential: superseded_by |
| **contracts** | • Child of: merchants, ai_extractions<br>• Parent to: contract_audit_log, handover_log |
| **contract_audit_log** | • Child of: contracts, merchants, call_transcriptions |
| **handover_log** | • Child of: merchants, contracts, account_managers<br>• Parent to: exception_log |
| **exception_log** | • Child of: merchants, handover_log |
| **order_events** | • Child of: merchants<br>• Used by: tt21_monitoring (aggregation) |
| **tt21_monitoring** | • Child of: merchants<br>• Parent to: intervention_log |
| **intervention_log** | • Child of: merchants, account_managers |
| **partner_communications** | • Child of: merchants |
| **account_managers** | • Parent to: merchants, handover_log, intervention_log |
| **sales_managers** | • Parent to: merchants, call_transcriptions |

---

## INDEXES & PERFORMANCE

### Critical Indexes for Performance

```sql
-- Most Queried Paths

-- 1. Find all merchants for a specific AM
CREATE INDEX idx_merchants_am_status
ON merchants(assigned_am_id, merchant_status);

-- 2. Find all active merchants going live soon
CREATE INDEX idx_merchants_go_live_status
ON merchants(go_live_date, merchant_status);

-- 3. Find all pending exceptions by severity
CREATE INDEX idx_exceptions_status_severity
ON exception_log(resolution_status, severity, created_at DESC);

-- 4. TT21 monitoring dashboard query
CREATE INDEX idx_tt21_status_go_live
ON tt21_monitoring(status, go_live_date);

-- 5. Daily exception report
CREATE INDEX idx_exceptions_created_type
ON exception_log(created_at DESC, exception_type, severity);

-- 6. Handover success rate reporting
CREATE INDEX idx_handover_status_completed
ON handover_log(handover_status, completed_at DESC);

-- 7. Find all extractions requiring manual review
CREATE INDEX idx_extractions_manual_review
ON ai_extractions(requires_manual_review, extracted_at DESC);

-- 8. Order history for merchant
CREATE INDEX idx_orders_merchant_timestamp
ON order_events(merchant_id, order_timestamp DESC);
```

### Query Optimization Notes

1. **Avoid SELECT * in production** - Always specify columns
2. **Use JSON_EXTRACT for JSON fields** - Index extracted values if queried frequently
3. **Partition large tables** - Consider partitioning `order_events` by month
4. **Archive old data** - Move completed handovers >90 days to archive table

---

## DATA RETENTION & ARCHIVAL

### Retention Policy

| Table | Retention Period | Archive Strategy |
|-------|-----------------|------------------|
| **call_transcriptions** | 2 years active | Move to cold storage after 2 years |
| **ai_extractions** | 2 years active | Archive with call_transcriptions |
| **validation_log** | 2 years active | Archive with extractions |
| **merchant_profiles** | Keep all versions | Soft delete only |
| **contracts** | Permanent | Never delete |
| **contract_audit_log** | Permanent | Compliance requirement |
| **handover_log** | 2 years active | Archive to reporting DB after 2 years |
| **exception_log** | 1 year active | Archive resolved exceptions >1 year |
| **order_events** | 2 years active | Aggregate to monthly summary, then delete |
| **tt21_monitoring** | Until TT21 achieved + 90 days | Archive after merchant active 90 days |
| **intervention_log** | 2 years active | Archive with handover_log |
| **partner_communications** | 1 year active | Archive after 1 year |

### Archival Process

```sql
-- Example: Archive completed handovers older than 90 days
INSERT INTO handover_log_archive
SELECT * FROM handover_log
WHERE handover_status IN ('COMPLETE', 'PARTIAL_SUCCESS')
  AND completed_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

DELETE FROM handover_log
WHERE handover_status IN ('COMPLETE', 'PARTIAL_SUCCESS')
  AND completed_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

---

## SAMPLE QUERIES

### 1. Get Complete Merchant Context

```sql
SELECT
    m.merchant_id,
    m.merchant_name,
    m.segment,
    mp.profile_summary,
    c.contract_status,
    c.go_live_date,
    h.handover_status,
    tt.status AS tt21_status,
    tt.current_order_count,
    am.am_name
FROM merchants m
LEFT JOIN merchant_profiles mp ON m.merchant_id = mp.merchant_id AND mp.is_current_version = TRUE
LEFT JOIN contracts c ON m.merchant_id = c.merchant_id
LEFT JOIN handover_log h ON m.merchant_id = h.merchant_id
LEFT JOIN tt21_monitoring tt ON m.merchant_id = tt.merchant_id
LEFT JOIN account_managers am ON m.assigned_am_id = am.am_id
WHERE m.merchant_id = 'M-12345';
```

### 2. Daily Exception Report

```sql
SELECT
    DATE(created_at) AS exception_date,
    severity,
    exception_type,
    COUNT(*) AS count,
    COUNT(CASE WHEN resolution_status = 'Resolved' THEN 1 END) AS resolved_count
FROM exception_log
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY DATE(created_at), severity, exception_type
ORDER BY severity, exception_type;
```

### 3. TT21 Dashboard

```sql
SELECT
    status,
    COUNT(*) AS merchant_count,
    AVG(current_order_count) AS avg_orders,
    AVG(days_since_go_live) AS avg_days
FROM tt21_monitoring
WHERE tt21_achieved = FALSE
GROUP BY status;
```

### 4. AM Workload

```sql
SELECT
    am.am_name,
    COUNT(DISTINCT m.merchant_id) AS total_merchants,
    COUNT(DISTINCT CASE WHEN tt.status = 'AT_RISK' THEN m.merchant_id END) AS at_risk_count,
    COUNT(DISTINCT CASE WHEN e.resolution_status = 'Open' THEN e.exception_id END) AS open_exceptions
FROM account_managers am
LEFT JOIN merchants m ON am.am_id = m.assigned_am_id
LEFT JOIN tt21_monitoring tt ON m.merchant_id = tt.merchant_id
LEFT JOIN exception_log e ON m.merchant_id = e.merchant_id
WHERE am.status = 'Active'
GROUP BY am.am_id, am.am_name
ORDER BY open_exceptions DESC, at_risk_count DESC;
```

---

**END OF DATABASE SCHEMA DOCUMENT**
