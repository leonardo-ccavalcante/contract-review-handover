# MANUS IM IMPLEMENTATION - DELIVERABLE SPECIFICATIONS

**Project:** Bolt Food Sales → AM Handover Automation
**Platform:** Manus IM
**Date:** 2026-02-12
**Version:** 1.0

---

## DELIVERABLE BREAKDOWN

Each deliverable is defined with clear **IN SCOPE** and **OUT OF SCOPE** boundaries.

---

## MODULE 1: SALES CALL PROCESSING

### Deliverable 1.1: Call Transcription Upload & Storage

**Purpose:** Accept sales call transcription and store for processing

**IN SCOPE:**
- ✅ Accept transcription file upload (.txt, .json, .srt formats)
- ✅ Validate file format and size (<50MB)
- ✅ Store raw transcription in database (table: `call_transcriptions`)
- ✅ Generate unique `call_id` (UUID format)
- ✅ Extract metadata: upload timestamp, file size, format
- ✅ Link to `merchant_id` (if exists) or create placeholder
- ✅ Trigger AI extraction workflow

**OUT OF SCOPE:**
- ❌ Audio file upload (only text transcription)
- ❌ Real-time transcription service (Gong/Chorus integration - Phase 2)
- ❌ Speaker diarization (assumed pre-processed)
- ❌ Audio quality analysis
- ❌ Multi-language detection (English/Portuguese only)

**Input Format:**
```json
{
  "call_id": "auto-generated-uuid",
  "uploaded_by": "user_id",
  "upload_timestamp": "2026-02-12T14:30:00Z",
  "transcription_text": "Full call transcript...",
  "merchant_name": "Pizzaria do Bairro",
  "sales_manager_id": "SM-12345",
  "call_date": "2026-02-10",
  "call_duration_minutes": 45
}
```

**Output:**
- Stored in `call_transcriptions` table
- Event trigger: `call.uploaded` → Routes to AI Extraction

**Success Criteria:**
- File uploaded within 5 seconds
- 100% format validation accuracy
- Zero data loss on storage

---

### Deliverable 1.2: AI Extraction Engine

**Purpose:** Extract structured data from call transcription

**IN SCOPE:**
- ✅ Extract contract terms (commission, campaign, tablet, duration)
- ✅ Extract business intelligence (revenue, competitors, goals)
- ✅ Extract owner profile (personality, concerns, motivations)
- ✅ Extract market intelligence (cuisine type, pricing sensitivity)
- ✅ Generate confidence score per field (0-100%)
- ✅ Flag fields with <90% confidence for manual review
- ✅ Store extracted data in `merchant_profiles` table
- ✅ Create audit trail (what was extracted, confidence, timestamp)

**OUT OF SCOPE:**
- ❌ Real-time extraction during live calls (batch only)
- ❌ Multi-call aggregation (Phase 2)
- ❌ Sentiment analysis of merchant tone
- ❌ Predictive closure probability scoring
- ❌ Automatic contract generation

**AI Model Requirements:**
- Model: GPT-4 or Claude 3.5 Sonnet
- Prompt: Structured extraction with JSON schema
- Context window: 128k tokens (handles 2-hour calls)
- Temperature: 0.1 (deterministic extraction)

**Input:**
- `call_id` + `transcription_text` from table

**Output Format:**
```json
{
  "extraction_id": "uuid",
  "call_id": "uuid",
  "extracted_at": "timestamp",
  "confidence_score_overall": 94,
  "contract_terms": {
    "commission": "12%",
    "commission_confidence": 98,
    "campaign_type": "15% discount for 60 days",
    "campaign_confidence": 95,
    "tablet_included": true,
    "tablet_confidence": 100,
    "contract_length": "12 months",
    "contract_length_confidence": 92
  },
  "business_context": {
    "current_revenue": "€350k/year estimate",
    "revenue_confidence": 75,
    "competitors": ["UberEats", "Glovo"],
    "competitors_confidence": 90,
    "goals": ["Reach new customers", "Increase weekend orders"],
    "goals_confidence": 88
  },
  "owner_profile": {
    "personality_traits": ["Growth-oriented", "Price-sensitive"],
    "personality_confidence": 80,
    "main_concerns": ["Commission structure", "Delivery reliability"],
    "concerns_confidence": 92,
    "decision_triggers": ["Competitor delays", "Market share"],
    "triggers_confidence": 85
  },
  "market_intelligence": {
    "cuisine_type": "Italian/Pizza",
    "cuisine_confidence": 100,
    "price_sensitivity": "High",
    "price_sensitivity_confidence": 78,
    "expansion_potential": "Considering 2nd location in 12 months",
    "expansion_confidence": 70
  },
  "flags": {
    "requires_manual_review": true,
    "low_confidence_fields": ["current_revenue", "expansion_potential"]
  }
}
```

**Success Criteria:**
- >90% field extraction accuracy on pilot dataset (100 calls)
- <5% hallucination rate (false information)
- Processing time <30 seconds per call
- Confidence score calibration within ±5%

---

### Deliverable 1.3: Hard Gate #1 - Pre-Contract Validation

**Purpose:** Block contract generation if data incomplete or low confidence

**IN SCOPE:**
- ✅ Validate all mandatory fields populated
- ✅ Check AI confidence score (>90% threshold)
- ✅ Block "Closed Won" status in CRM if validation fails
- ✅ Generate validation report (what's missing, what needs review)
- ✅ Route to Sales Ops if confidence <90%
- ✅ Allow Sales Manager override (with justification required)
- ✅ Log all validation attempts (pass/fail) with reasons

**OUT OF SCOPE:**
- ❌ Automatic contract generation (Phase 2)
- ❌ Legal review workflow integration
- ❌ E-signature integration (DocuSign/PandaDoc)
- ❌ Multi-stage approval workflow

**Business Logic:** (See Decision Tree #1)

**Input:**
- `extraction_id` + `merchant_id`

**Output:**
```json
{
  "validation_id": "uuid",
  "extraction_id": "uuid",
  "validation_status": "PASS" | "FAIL" | "MANUAL_REVIEW",
  "validation_timestamp": "timestamp",
  "validation_results": {
    "mandatory_fields_complete": true,
    "ai_confidence_threshold_met": false,
    "missing_fields": [],
    "low_confidence_fields": ["current_revenue", "expansion_potential"]
  },
  "next_action": "ROUTE_TO_SALES_OPS",
  "blocking_reasons": [
    "AI confidence 87% < 90% threshold",
    "Manual review required for revenue estimate"
  ],
  "can_proceed_to_contract": false,
  "override_available": true,
  "override_requires": "Sales Manager approval + justification"
}
```

**Success Criteria:**
- 100% blocking accuracy (no invalid data passes gate)
- <2% false positive rate (valid data blocked incorrectly)
- Override workflow completes in <5 minutes

---

## MODULE 2: SALES CO-PILOT (PHASE 2 - OUT OF SCOPE FOR V1)

### Deliverable 2.1: Real-Time AI Assistant

**Purpose:** Provide live suggestions during sales calls

**STATUS:** ⏸️ **Deferred to Phase 2**

**Reason:** Requires Gong/Chorus integration + real-time inference infrastructure. Phase 1 focuses on post-call batch processing.

---

## MODULE 3: CONTRACT & MERCHANT PROFILE MANAGEMENT

### Deliverable 3.1: Merchant Profile Creation

**Purpose:** Structure extracted data into standardized merchant profile

**IN SCOPE:**
- ✅ Create/update `merchant_profiles` table record
- ✅ Store complete extracted data with confidence scores
- ✅ Generate profile summary (executive overview)
- ✅ Tag profile for AM access (CRM integration)
- ✅ Version control (track profile updates over time)
- ✅ Link to original call transcript (audit trail)

**OUT OF SCOPE:**
- ❌ Multi-call aggregation (merge data from multiple calls)
- ❌ Predictive scoring (churn risk, growth potential)
- ❌ Automatic segmentation (SMB/MM/Enterprise classification)
- ❌ Competitive intelligence dashboard

**Database Schema:** (See Table Relationships)

**Input:**
- Validated extraction data (post-Hard Gate #1)

**Output:**
```json
{
  "profile_id": "uuid",
  "merchant_id": "M-12345",
  "merchant_name": "Pizzaria do Bairro",
  "profile_version": 1,
  "created_at": "timestamp",
  "source_call_id": "uuid",
  "segment": "SMB",
  "contract_terms": { /* from extraction */ },
  "business_context": { /* from extraction */ },
  "owner_profile": { /* from extraction */ },
  "market_intelligence": { /* from extraction */ },
  "profile_summary": "Growth-oriented Italian restaurant in Bay Ridge. Currently on UberEats and Glovo. Main concern: commission structure. Expected 50-60 orders/week. High price sensitivity.",
  "ai_metadata": {
    "extraction_confidence": 94,
    "extraction_date": "timestamp",
    "human_review_required": false
  },
  "access_control": {
    "visible_to": ["AM", "Sales Ops", "Success Team"],
    "created_by": "SM-12345"
  }
}
```

**Success Criteria:**
- Profile created within 2 seconds of extraction validation
- 100% data integrity (no field loss)
- Accessible to AM within 1 minute

---

### Deliverable 3.2: AI Contract Auditor

**Purpose:** Compare signed contract with call transcript promises

**IN SCOPE:**
- ✅ Accept signed contract document (PDF upload)
- ✅ Extract contract terms using OCR + NLP
- ✅ Compare with call transcript promises
- ✅ Flag discrepancies (verbal promise ≠ written contract)
- ✅ Generate discrepancy report with severity (High/Medium/Low)
- ✅ Route to Sales Ops for resolution

**OUT OF SCOPE:**
- ❌ Automatic contract correction/regeneration
- ❌ Legal clause analysis (compliance checks)
- ❌ Multi-party contract comparison
- ❌ Historical contract version tracking

**Business Logic:** (See Decision Tree #2)

**Input:**
```json
{
  "contract_id": "uuid",
  "merchant_id": "M-12345",
  "signed_contract_pdf": "base64_encoded_file",
  "source_call_id": "uuid",
  "contract_signed_at": "timestamp"
}
```

**Output:**
```json
{
  "audit_id": "uuid",
  "contract_id": "uuid",
  "audit_timestamp": "timestamp",
  "discrepancies_found": true,
  "discrepancy_count": 2,
  "discrepancies": [
    {
      "field": "commission",
      "verbal_promise": "10% commission",
      "contract_term": "12% commission",
      "call_timestamp": "00:23:15",
      "severity": "HIGH",
      "impact": "Revenue discrepancy, likely escalation"
    },
    {
      "field": "campaign_duration",
      "verbal_promise": "90 days discount",
      "contract_term": "60 days discount",
      "call_timestamp": "00:31:42",
      "severity": "MEDIUM",
      "impact": "Merchant expectation mismatch"
    }
  ],
  "action_required": "SALES_OPS_REVIEW",
  "blocks_go_live": false,
  "sla": "48h resolution"
}
```

**Success Criteria:**
- >95% discrepancy detection accuracy
- <3% false positive rate
- Processing time <60 seconds per contract

---

## MODULE 4: AUTOMATED HANDOVER WORKFLOWS

### Deliverable 4.1: SMB Handover Automation

**Purpose:** Zero-touch configuration for SMB merchants

**IN SCOPE:**
- ✅ Trigger on contract signature event (DocuSign webhook)
- ✅ Validate data completeness (Hard Gate #2)
- ✅ Configure billing system (commission structure)
- ✅ Schedule campaign activation (D0 - Go-Live date)
- ✅ Queue tablet activation
- ✅ Generate handover dossier (30-second summary)
- ✅ Send AM notification (Slack + Email)
- ✅ Log all actions in audit trail

**OUT OF SCOPE:**
- ❌ Multi-location setup (Phase 2 - MM/Enterprise)
- ❌ Custom campaign configuration
- ❌ Manual approval workflow
- ❌ Physical tablet shipment tracking

**Business Logic:** (See Decision Tree #3)

**Trigger Event:**
```json
{
  "event": "contract.signed",
  "merchant_id": "M-12345",
  "contract_id": "uuid",
  "signed_at": "timestamp",
  "go_live_date": "2026-02-15T14:00:00Z"
}
```

**Workflow Steps:**

**Step 1: Data Validation (Hard Gate #2)**
```
CHECK:
  - merchant_profiles.mandatory_fields = 100% complete
  - contract_terms validated
  - no blocking discrepancies from audit

IF FAIL → Block workflow, notify SM
IF PASS → Continue to Step 2
```

**Step 2: Billing Configuration**
```
API Call: Salesforce → Billing System
Payload:
{
  "merchant_id": "M-12345",
  "commission_percentage": 12,
  "effective_date": "2026-02-15",
  "billing_cadence": "monthly",
  "payment_method": "bank_transfer"
}
Response: billing_config_id
```

**Step 3: Campaign Scheduling**
```
API Call: Salesforce → Campaign Tool
Payload:
{
  "merchant_id": "M-12345",
  "campaign_type": "discount",
  "discount_percentage": 15,
  "duration_days": 60,
  "start_date": "2026-02-15T14:00:00Z"
}
Response: campaign_id (status: QUEUED)
```

**Step 4: Tablet Activation**
```
API Call: Salesforce → Tablet Management
Payload:
{
  "merchant_id": "M-12345",
  "tablet_model": "T-200",
  "activation_date": "2026-02-15T14:00:00Z",
  "configuration": "single_location_standard"
}
Response: tablet_id (status: QUEUED)
```

**Step 5: Handover Dossier Generation**
```
AI Generation: Create summary from merchant_profile
Template: 30-Second Handover Dossier
Output: handover_dossier_text
```

**Step 6: AM Notification**
```
Slack Message:
📋 NEW HANDOVER - Pizzaria do Bairro
• Type: SMB | Single Location
• Go-Live: Tomorrow 14:00 CET
• Status: ✅ All systems configured
• Action: Review dossier, schedule D+1 call
• Dossier: [View Document]

Email:
Subject: New Partner Go-Live Tomorrow - Pizzaria do Bairro
Attachments: handover_dossier.pdf, merchant_profile.json
```

**Output:**
```json
{
  "handover_id": "uuid",
  "merchant_id": "M-12345",
  "handover_status": "COMPLETE",
  "completed_at": "timestamp",
  "execution_time_seconds": 8,
  "steps_completed": [
    "data_validation",
    "billing_configured",
    "campaign_scheduled",
    "tablet_queued",
    "dossier_generated",
    "am_notified"
  ],
  "errors": [],
  "billing_config_id": "uuid",
  "campaign_id": "uuid",
  "tablet_id": "uuid",
  "assigned_am": "AM-67890",
  "dossier_url": "https://..."
}
```

**Success Criteria:**
- <10 minute total execution time (target: <5 min)
- >98% automation success rate
- Zero billing configuration errors
- 100% AM notification delivery

---

### Deliverable 4.2: Exception Handling & Daily Log

**Purpose:** Capture and report all automation failures

**IN SCOPE:**
- ✅ Log all workflow exceptions in `exception_log` table
- ✅ Categorize by severity (P0/P1/P2)
- ✅ Generate daily report (09:00 CET)
- ✅ Send to Ops Team (Email + Slack)
- ✅ Track resolution status and time
- ✅ Root cause tagging (for continuous improvement)

**OUT OF SCOPE:**
- ❌ Automatic error retry logic (manual only for V1)
- ❌ Predictive failure detection
- ❌ Real-time alerting (daily batch only)

**Exception Categories:**

| Category | Examples | Severity | SLA |
|----------|----------|----------|-----|
| **Campaign Failures** | API timeout, invalid discount code | P1 | 8h |
| **Billing Errors** | Commission not applied, API error | P0 | 2h |
| **Missing Data** | Merchant profile incomplete post-gate | P2 | 24h |
| **API Failures** | Tablet system down, campaign tool 500 error | P0 | 2h |
| **Contract Discrepancies** | Unresolved audit findings >48h | P1 | 24h |

**Daily Report Format:**
```
📊 DAILY EXCEPTION LOG - 2026-02-12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 P0 Issues: 2 (requires immediate action)
🟡 P1 Issues: 5 (review within 8h)
🟢 P2 Issues: 3 (review within 24h)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P0-001: Billing API Failure
• Merchant: Pizzaria do Bairro (M-12345)
• Issue: Commission not applied (500 error)
• Impact: Partner goes live without billing
• Action: Manual config required
• Owner: Finance Ops
• Created: 2026-02-12 08:23

P0-002: Campaign Tool Timeout
• Merchant: Sushi Express (M-12347)
• Issue: API timeout after 30s
• Impact: Campaign not scheduled
• Action: Retry + investigate API
• Owner: Campaign Ops
• Created: 2026-02-12 09:15

[Full report continues...]
```

**Success Criteria:**
- 100% exception capture rate
- Report delivered by 09:00 CET daily
- <5% exception rate (target: <20 issues/day for 1000 handovers/month)

---

## MODULE 5: PARTNER COMMUNICATIONS

### Deliverable 5.1: WhatsApp/SMS Confirmation

**Purpose:** Send immediate confirmation to merchant on campaign activation

**IN SCOPE:**
- ✅ Trigger on campaign activation (D0 - Go-Live)
- ✅ Send WhatsApp Business API message (fallback to SMS)
- ✅ Personalized message with merchant name, campaign details
- ✅ Track delivery status (sent/delivered/read)
- ✅ Log communication in `partner_communications` table

**OUT OF SCOPE:**
- ❌ Two-way conversation (automated responses)
- ❌ Multi-language support (Portuguese only for V1)
- ❌ Rich media (images, videos)
- ❌ Template A/B testing

**Message Template:**
```
🎉 Sua campanha de {discount}% está ativa no Bolt Food!

{merchant_name}, seu restaurante está agora disponível
para milhares de clientes em {neighborhood}.

✅ Desconto de {discount}% ativo por {duration} dias
✅ Tablet configurado e funcionando
✅ Pedidos a caminho!

Dúvidas? Seu Account Manager {am_name} liga amanhã para apoiar.

- Equipe Bolt Food
```

**Input:**
```json
{
  "merchant_id": "M-12345",
  "merchant_name": "Pizzaria do Bairro",
  "phone": "+351912345678",
  "campaign_discount": 15,
  "campaign_duration": 60,
  "neighborhood": "Bay Ridge",
  "assigned_am_name": "João Silva",
  "go_live_timestamp": "2026-02-15T14:00:00Z"
}
```

**Output:**
```json
{
  "communication_id": "uuid",
  "merchant_id": "M-12345",
  "channel": "whatsapp",
  "message_sent_at": "timestamp",
  "delivery_status": "delivered",
  "read_at": "timestamp",
  "cost": 0.05,
  "template_id": "campaign_activation_pt"
}
```

**Success Criteria:**
- >98% delivery rate
- Message sent within 60 seconds of campaign activation
- Cost: <€0.05 per message

---

### Deliverable 5.2: PDF Summary Document

**Purpose:** Provide written record of contract and commitments

**IN SCOPE:**
- ✅ Generate PDF on contract signature
- ✅ Include: Contract summary, growth plan, key contacts
- ✅ Send via email to merchant
- ✅ Store in Salesforce (AM access)
- ✅ Track email open rate

**OUT OF SCOPE:**
- ❌ Interactive PDF (fillable forms)
- ❌ Multi-language versions
- ❌ Custom branding per market
- ❌ Version control for updates

**PDF Structure:**

**Page 1: Contract Summary**
- Commission structure
- Campaign details (discount, duration)
- Tablet information (model, free/paid)
- Contract duration
- Effective date

**Page 2: Growth Plan**
- Merchant's stated goals (from call transcript)
- Bolt's commitments (campaign, support)
- Expected order volumes
- Success metrics (TT21 target)
- Next steps with AM

**Page 3: Key Contacts**
- Account Manager (name, photo, email, phone)
- Support hotline
- Portal login credentials
- Escalation contacts

**Success Criteria:**
- PDF generated within 30 seconds
- Email delivery rate >95%
- Document stored in Salesforce (100% success)

---

## MODULE 6: MONITORING & ANALYTICS

### Deliverable 6.1: TT21 Monitoring Dashboard

**Purpose:** Track partners' progress to 21st order

**IN SCOPE:**
- ✅ Real-time order count per merchant
- ✅ Days since Go-Live counter
- ✅ Alert at D+18 if <18 orders (at-risk flag)
- ✅ Success notification at 21 orders
- ✅ AM dashboard view (all assigned partners)
- ✅ Exportable reports (CSV)

**OUT OF SCOPE:**
- ❌ Predictive churn modeling
- ❌ Menu optimization recommendations
- ❌ Competitive benchmarking
- ❌ Financial performance tracking

**Dashboard Views:**

**AM View:**
```
MY PARTNERS - TT21 TRACKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 On Track: 12 partners
🟡 At Risk: 3 partners (D+18, <18 orders)
🔴 Escalate: 1 partner (D+21, <21 orders)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AT RISK PARTNERS:
┌─────────────────────┬──────┬────────┬────────┐
│ Merchant            │ Days │ Orders │ Action │
├─────────────────────┼──────┼────────┼────────┤
│ Pizzaria do Bairro  │ D+18 │ 16/21  │ 🟡 Call│
│ Sushi Express       │ D+19 │ 14/21  │ 🟡 Call│
│ Burger King Clone   │ D+20 │ 12/21  │ 🔴 Urg │
└─────────────────────┴──────┴────────┴────────┘
```

**Success Criteria:**
- Real-time data refresh (<5 min lag)
- 100% alert delivery (D+18 notifications)
- Dashboard load time <2 seconds

---

## MODULE 7: DATA STORAGE & MANAGEMENT

### Deliverable 7.1: Database Schema Implementation

**Purpose:** Store all data with proper relationships and constraints

**IN SCOPE:**
- ✅ All tables defined (see Table Relationships section)
- ✅ Foreign key constraints
- ✅ Indexes on frequently queried fields
- ✅ Audit trail columns (created_at, updated_at, updated_by)
- ✅ Soft delete support (deleted_at column)

**OUT OF SCOPE:**
- ❌ Multi-tenancy (single Bolt instance only)
- ❌ Data encryption at rest (use platform default)
- ❌ Real-time replication
- ❌ Data warehouse integration

**See:** [manus-im-database-schema.md](manus-im-database-schema.md) for complete schema

---

## PHASE 1 SCOPE SUMMARY

### ✅ INCLUDED IN V1 (MVP)

1. ✅ Call transcription upload
2. ✅ AI extraction engine
3. ✅ Hard Gate #1 (pre-contract validation)
4. ✅ Merchant profile creation
5. ✅ AI Contract Auditor
6. ✅ SMB handover automation
7. ✅ Exception log (daily batch)
8. ✅ WhatsApp confirmation
9. ✅ PDF summary document
10. ✅ TT21 monitoring dashboard
11. ✅ Database schema

### ❌ DEFERRED TO PHASE 2

1. ❌ Sales Co-Pilot (real-time AI assistant)
2. ❌ Multi-call aggregation
3. ❌ Mid-Market/Enterprise workflows
4. ❌ Predictive analytics
5. ❌ Gong/Chorus real-time integration
6. ❌ Automated contract generation
7. ❌ Multi-language support
8. ❌ Advanced dashboards (Sales Ops, Intel Team)

---

## DELIVERABLE ACCEPTANCE CRITERIA

Each deliverable must meet:

1. **Functional:** Completes all IN SCOPE items
2. **Performance:** Meets specified SLA (response time, throughput)
3. **Quality:** Passes accuracy thresholds (e.g., >90% extraction accuracy)
4. **Testable:** Has defined test cases with pass/fail criteria
5. **Documented:** User guide + technical documentation provided
6. **Monitored:** Logging and metrics instrumentation included

---

## NEXT STEPS

1. Review and approve deliverable specs
2. Create decision tree logic diagrams
3. Define database schema with table relationships
4. Build Manus IM workflows
5. Set up testing environment
6. Begin pilot with 100 sample calls

---

**END OF DELIVERABLES SPECIFICATION**
