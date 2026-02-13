# MANUS IM IMPLEMENTATION - DECISION TREE LOGIC

**Project:** Bolt Food Sales → AM Handover Automation
**Purpose:** Business logic and branching rules
**Date:** 2026-02-12
**Version:** 1.0

---

## DECISION TREE INDEX

1. **DT-001:** Hard Gate #1 - Pre-Contract Validation
2. **DT-002:** AI Contract Auditor - Discrepancy Handling
3. **DT-003:** SMB Handover Automation - Workflow Routing
4. **DT-004:** Exception Classification & Routing
5. **DT-005:** TT21 Monitoring - Intervention Logic
6. **DT-006:** Manual Review Queue - Priority Assignment

---

## DT-001: HARD GATE #1 - PRE-CONTRACT VALIDATION

**Purpose:** Determine if deal can proceed to contract generation

**Trigger:** AI extraction complete → Validation check requested

```
START: AI Extraction Complete
│
├─ CHECK: Deal Status
│  │
│  ├─ Deal Status = "Not Closed"
│  │  │
│  │  └─→ ROUTE TO: Retry Intelligence Generation
│  │     │
│  │     ├─ Extract: Main objection trigger
│  │     ├─ Extract: Merchant behavior pattern
│  │     ├─ Suggest: Winning arguments from RAG
│  │     ├─ Recommend: Follow-up timing
│  │     │
│  │     └─→ OUTPUT: Retry Intelligence Report
│  │        └─→ SEND TO: SDR + Sales Manager
│  │        └─→ STATUS: "PENDING_RETRY"
│  │        └─→ END
│  │
│  └─ Deal Status = "Closed"
│     │
│     └─→ PROCEED TO: Validation Checks
│
├─ VALIDATION CHECK 1: Mandatory Fields
│  │
│  ├─ CHECK: All mandatory fields populated?
│  │  │
│  │  ├─ Fields Required:
│  │  │  • merchant_name ✓
│  │  │  • commission_percentage ✓
│  │  │  • campaign_type ✓
│  │  │  • campaign_duration ✓
│  │  │  • tablet_included ✓
│  │  │  • contract_length ✓
│  │  │  • merchant_goals (at least 1) ✓
│  │  │  • competitors (at least 1) ✓
│  │  │
│  │  ├─ IF All Present = TRUE
│  │  │  └─→ PROCEED TO: Validation Check 2
│  │  │
│  │  └─ IF Any Missing = TRUE
│  │     │
│  │     └─→ BLOCK CONTRACT GENERATION
│  │        │
│  │        ├─ Generate: Missing Fields Report
│  │        ├─ Notify: Sales Manager via Salesforce
│  │        ├─ Create: Task "Complete Missing Fields"
│  │        ├─ Log: exception_log (P2 - Data Quality)
│  │        │
│  │        └─→ STATUS: "BLOCKED_INCOMPLETE"
│  │        └─→ END
│
├─ VALIDATION CHECK 2: AI Confidence Score
│  │
│  ├─ CHECK: Overall confidence >= 90%?
│  │  │
│  │  ├─ IF Confidence >= 90%
│  │  │  │
│  │  │  └─→ ROUTE TO: SM Review & Confirm
│  │  │     │
│  │  │     ├─ Present: Extracted data for review
│  │  │     ├─ Require: SM confirmation (checkbox)
│  │  │     │
│  │  │     └─ IF SM Confirms = TRUE
│  │  │        └─→ PASS GATE
│  │  │           └─→ STATUS: "VALIDATED_AUTO"
│  │  │           └─→ PROCEED TO: Contract Generation
│  │  │           └─→ END
│  │  │
│  │  └─ IF Confidence < 90%
│  │     │
│  │     └─→ ROUTE TO: Sales Ops Manual Review
│  │        │
│  │        ├─ Create: Review ticket in Salesforce
│  │        ├─ Assign: Sales Ops team
│  │        ├─ SLA: 2 hours
│  │        ├─ Include: Low confidence fields flagged
│  │        │
│  │        └─→ WAIT FOR: Sales Ops review completion
│  │           │
│  │           ├─ Sales Ops Actions:
│  │           │  • Review call transcript
│  │           │  • Correct/complete fields
│  │           │  • Update confidence to 100%
│  │           │  • Add notes (why AI struggled)
│  │           │
│  │           └─ Sales Ops Completes Review
│  │              │
│  │              └─→ ROUTE TO: SM Confirmation
│  │                 │
│  │                 └─ IF SM Confirms Corrections = TRUE
│  │                    └─→ PASS GATE
│  │                       └─→ STATUS: "VALIDATED_MANUAL"
│  │                       └─→ PROCEED TO: Contract Generation
│  │                       └─→ END
│
├─ OVERRIDE PATH (Optional)
│  │
│  ├─ IF Gate Blocked BUT SM requests override
│  │  │
│  │  └─→ REQUIRE: Sales Manager Approval
│  │     │
│  │     ├─ CHECK: User role = "Sales Manager" OR "Regional Director"?
│  │     │  │
│  │     │  ├─ IF Authorized = TRUE
│  │     │  │  │
│  │     │  │  └─→ PROMPT: Justification (text field required)
│  │     │  │     │
│  │     │  │     └─ IF Justification Provided
│  │     │  │        │
│  │     │  │        └─→ LOG: Override event with justification
│  │     │  │        └─→ PASS GATE (with flag)
│  │     │  │        └─→ STATUS: "VALIDATED_OVERRIDE"
│  │     │  │        └─→ Notify: Sales Ops (for audit)
│  │     │  │        └─→ PROCEED TO: Contract Generation
│  │     │  │        └─→ END
│  │     │  │
│  │     │  └─ IF Authorized = FALSE
│  │     │     │
│  │     │     └─→ DENY OVERRIDE
│  │     │        └─→ MESSAGE: "Requires Sales Manager approval"
│  │     │        └─→ END
│  │     │
│  │     └─ ELSE (No override requested)
│  │        └─→ Remain BLOCKED
│  │        └─→ END
│
└─ END OF DECISION TREE DT-001
```

---

## DT-002: AI CONTRACT AUDITOR - DISCREPANCY HANDLING

**Purpose:** Compare signed contract with call promises and route discrepancies

**Trigger:** Contract signed + uploaded to system

```
START: Signed Contract Uploaded
│
├─ STEP 1: Extract Contract Terms
│  │
│  ├─ Use: OCR + NLP extraction
│  ├─ Extract:
│  │  • Commission percentage
│  │  • Campaign type + duration
│  │  • Tablet terms (free/paid, model)
│  │  • Contract length
│  │  • Special clauses
│  │
│  └─→ OUTPUT: Extracted contract terms (JSON)
│
├─ STEP 2: Retrieve Call Transcript Promises
│  │
│  ├─ Query: merchant_profiles.contract_terms
│  ├─ Query: call_transcriptions (original text)
│  │
│  └─→ OUTPUT: Verbal promises from calls
│
├─ STEP 3: Compare Terms (Field-by-Field)
│  │
│  ├─ FOR EACH Field:
│  │  • commission
│  │  • campaign_type
│  │  • campaign_duration
│  │  • tablet_included
│  │  • tablet_model
│  │  • contract_length
│  │
│  ├─ CHECK: verbal_promise == contract_term?
│  │
│  │  ├─ IF Match = TRUE
│  │  │  └─→ Mark field as ✅ VALIDATED
│  │  │
│  │  └─ IF Mismatch = TRUE
│  │     │
│  │     └─→ DISCREPANCY DETECTED
│  │        │
│  │        ├─ Capture:
│  │        │  • Field name
│  │        │  • Verbal promise (exact quote)
│  │        │  • Contract term (exact text)
│  │        │  • Call timestamp (where promise was made)
│  │        │
│  │        └─→ Assess Severity (see severity matrix below)
│  │
│  └─→ COMPILE: Discrepancy list
│
├─ STEP 4: Severity Assessment
│  │
│  ├─ Severity Matrix:
│  │
│  │  HIGH SEVERITY:
│  │  • Commission mismatch (revenue impact)
│  │  • Contract length mismatch (>3 months difference)
│  │  • Tablet terms mismatch (free → paid)
│  │  → Impact: Direct revenue loss OR likely escalation
│  │
│  │  MEDIUM SEVERITY:
│  │  • Campaign duration mismatch (1-4 weeks difference)
│  │  • Campaign type different but similar value
│  │  • Tablet model different
│  │  → Impact: Merchant expectation mismatch, moderate escalation risk
│  │
│  │  LOW SEVERITY:
│  │  • Minor wording differences (same intent)
│  │  • Non-material clauses
│  │  → Impact: Minimal, unlikely to cause escalation
│  │
│  └─→ Assign severity to each discrepancy
│
├─ DECISION POINT: Any Discrepancies Found?
│  │
│  ├─ IF No Discrepancies (All fields match)
│  │  │
│  │  └─→ PASS AUDIT
│  │     │
│  │     ├─ Set: contract_status = "VALIDATED"
│  │     ├─ Log: audit_log (success)
│  │     │
│  │     └─→ PROCEED TO: Handover Automation
│  │     └─→ END
│  │
│  └─ IF Discrepancies Found
│     │
│     └─→ GENERATE: Discrepancy Report
│        │
│        ├─ Report Contents:
│        │  • Merchant details
│        │  • Discrepancy count
│        │  • Each discrepancy:
│        │    - Field name
│        │    - Verbal promise (with call timestamp link)
│        │    - Contract term
│        │    - Severity (H/M/L)
│        │    - Business impact explanation
│        │
│        └─→ ROUTE BY: Highest Severity
│           │
│           ├─ IF Highest Severity = HIGH
│           │  │
│           │  └─→ URGENT ROUTING
│           │     │
│           │     ├─ Create: High-priority ticket in Salesforce
│           │     ├─ Assign: Sales Ops + Account Manager
│           │     ├─ SLA: 24 hours resolution
│           │     ├─ Notify: Email + Slack (immediate)
│           │     ├─ Flag: DO NOT proceed to Go-Live until resolved
│           │     │
│           │     └─→ STATUS: "BLOCKED_HIGH_DISCREPANCY"
│           │        └─→ Log: exception_log (P0)
│           │        └─→ END (wait for manual resolution)
│           │
│           ├─ IF Highest Severity = MEDIUM
│           │  │
│           │  └─→ STANDARD ROUTING
│           │     │
│           │     ├─ Create: Standard ticket in Salesforce
│           │     ├─ Assign: Sales Ops
│           │     ├─ SLA: 48 hours resolution
│           │     ├─ Notify: Email (next business day)
│           │     ├─ Allow: Proceed to Go-Live (discrepancy noted)
│           │     │
│           │     └─→ STATUS: "VALIDATED_WITH_WARNINGS"
│           │        └─→ Log: exception_log (P1)
│           │        └─→ PROCEED TO: Handover Automation (with flag)
│           │        └─→ END
│           │
│           └─ IF Highest Severity = LOW
│              │
│              └─→ LOW-PRIORITY ROUTING
│                 │
│                 ├─ Create: Info ticket in Salesforce
│                 ├─ Assign: Sales Ops (review when available)
│                 ├─ SLA: 72 hours (informational)
│                 ├─ Notify: Daily digest email
│                 ├─ Allow: Proceed to Go-Live (no blocking)
│                 │
│                 └─→ STATUS: "VALIDATED_MINOR_NOTES"
│                    └─→ Log: audit_log (non-critical)
│                    └─→ PROCEED TO: Handover Automation
│                    └─→ END
│
└─ END OF DECISION TREE DT-002
```

---

## DT-003: SMB HANDOVER AUTOMATION - WORKFLOW ROUTING

**Purpose:** Determine automation path based on merchant segment and data quality

**Trigger:** Contract signed + validated

```
START: Contract Signature Event Received
│
├─ STEP 1: Identify Merchant Segment
│  │
│  ├─ Query: merchant_profiles.segment
│  │
│  ├─ Segment Classification:
│  │  • SMB: 1 location, <€500k revenue, standard package
│  │  • Mid-Market: 2-10 locations, €500k-€5M revenue
│  │  • Enterprise: 10+ locations, >€5M revenue, custom terms
│  │
│  └─→ OUTPUT: segment_type
│
├─ DECISION POINT: Segment Type?
│  │
│  ├─ IF segment_type = "SMB"
│  │  │
│  │  └─→ CHECK: Data Completeness (Hard Gate #2)
│  │     │
│  │     ├─ Validate:
│  │     │  • merchant_profiles.mandatory_fields = 100% complete
│  │     │  • contract_terms validated (no HIGH discrepancies)
│  │     │  • billing details present
│  │     │  • go_live_date defined
│  │     │
│  │     ├─ IF Validation PASS
│  │     │  │
│  │     │  └─→ ROUTE TO: SMB Zero-Touch Automation
│  │     │     │
│  │     │     ├─ Execute: Billing Configuration API
│  │     │     ├─ Execute: Campaign Scheduling API
│  │     │     ├─ Execute: Tablet Activation API
│  │     │     ├─ Generate: Handover Dossier (AI)
│  │     │     ├─ Send: AM Notification (Slack + Email)
│  │     │     │
│  │     │     └─→ STATUS: "HANDOVER_COMPLETE_AUTO"
│  │     │        └─→ Log: handover_log (success)
│  │     │        └─→ END
│  │     │
│  │     └─ IF Validation FAIL
│  │        │
│  │        └─→ BLOCK AUTOMATION
│  │           │
│  │           ├─ Generate: Validation failure report
│  │           ├─ Notify: Sales Manager (complete missing data)
│  │           ├─ Create: Task in Salesforce
│  │           ├─ Log: exception_log (P2)
│  │           │
│  │           └─→ STATUS: "HANDOVER_BLOCKED"
│  │              └─→ END (wait for data completion)
│  │
│  ├─ IF segment_type = "Mid-Market"
│  │  │
│  │  └─→ ROUTE TO: Hybrid Workflow (Phase 2 - OUT OF SCOPE)
│  │     │
│  │     └─→ STATUS: "MANUAL_HANDOVER_REQUIRED"
│  │        └─→ Notify: Sales Ops + AM
│  │        └─→ END
│  │
│  └─ IF segment_type = "Enterprise"
│     │
│     └─→ ROUTE TO: White-Glove Workflow (Phase 2 - OUT OF SCOPE)
│        │
│        └─→ STATUS: "MANUAL_HANDOVER_REQUIRED"
│           └─→ Notify: Enterprise AM + Sales Ops
│           └─→ END
│
└─ SMB ZERO-TOUCH AUTOMATION (Detailed Flow)
   │
   ├─ STEP 1: Billing Configuration
   │  │
   │  ├─ API Call: Salesforce → Billing System
   │  │
   │  ├─ CHECK: API Response Status
   │  │  │
   │  │  ├─ IF Status = 200 (Success)
   │  │  │  │
   │  │  │  └─→ Capture: billing_config_id
   │  │  │     └─→ Mark: billing_configured = TRUE
   │  │  │     └─→ PROCEED TO: Step 2
   │  │  │
   │  │  └─ IF Status = Error (4xx, 5xx, timeout)
   │  │     │
   │  │     └─→ HANDLE ERROR
   │  │        │
   │  │        ├─ Log: exception_log (P0 - Revenue Impact)
   │  │        ├─ Set: billing_configured = FALSE
   │  │        ├─ Notify: Finance Ops (immediate - Slack)
   │  │        ├─ Create: Urgent ticket (2h SLA)
   │  │        │
   │  │        └─→ DECISION: Continue or Block?
   │  │           │
   │  │           ├─ IF go_live_date > 48h away
   │  │           │  └─→ CONTINUE (can fix before Go-Live)
   │  │           │     └─→ PROCEED TO: Step 2
   │  │           │
   │  │           └─ IF go_live_date < 48h away
   │  │              └─→ BLOCK HANDOVER
   │  │                 └─→ STATUS: "HANDOVER_FAILED_BILLING"
   │  │                 └─→ END (wait for manual fix)
   │
   ├─ STEP 2: Campaign Scheduling
   │  │
   │  ├─ API Call: Salesforce → Campaign Tool
   │  │
   │  ├─ CHECK: API Response Status
   │  │  │
   │  │  ├─ IF Status = 200 (Success)
   │  │  │  │
   │  │  │  └─→ Capture: campaign_id
   │  │  │     └─→ Mark: campaign_scheduled = TRUE
   │  │  │     └─→ PROCEED TO: Step 3
   │  │  │
   │  │  └─ IF Status = Error
   │  │     │
   │  │     └─→ HANDLE ERROR
   │  │        │
   │  │        ├─ Log: exception_log (P1 - Partner Experience)
   │  │        ├─ Set: campaign_scheduled = FALSE
   │  │        ├─ Notify: Campaign Ops (8h SLA)
   │  │        ├─ Create: Ticket for manual scheduling
   │  │        │
   │  │        └─→ CONTINUE (non-blocking, can fix before D0)
   │  │           └─→ PROCEED TO: Step 3
   │
   ├─ STEP 3: Tablet Activation
   │  │
   │  ├─ API Call: Salesforce → Tablet Management
   │  │
   │  ├─ CHECK: API Response Status
   │  │  │
   │  │  ├─ IF Status = 200 (Success)
   │  │  │  │
   │  │  │  └─→ Capture: tablet_id
   │  │  │     └─→ Mark: tablet_queued = TRUE
   │  │  │     └─→ PROCEED TO: Step 4
   │  │  │
   │  │  └─ IF Status = Error
   │  │     │
   │  │     └─→ HANDLE ERROR
   │  │        │
   │  │        ├─ Log: exception_log (P1)
   │  │        ├─ Set: tablet_queued = FALSE
   │  │        ├─ Notify: Tablet Ops (8h SLA)
   │  │        │
   │  │        └─→ CONTINUE (can manually activate)
   │  │           └─→ PROCEED TO: Step 4
   │
   ├─ STEP 4: Generate Handover Dossier
   │  │
   │  ├─ AI Call: Generate summary from merchant_profile
   │  │
   │  ├─ Template: 30-Second Handover Dossier
   │  │
   │  └─→ OUTPUT: handover_dossier_text
   │     └─→ PROCEED TO: Step 5
   │
   ├─ STEP 5: Notify Account Manager
   │  │
   │  ├─ Query: Assigned AM from merchant_profiles.assigned_am
   │  │
   │  ├─ Send: Slack notification
   │  ├─ Send: Email with attachments (dossier PDF, profile JSON)
   │  │
   │  └─→ Mark: am_notified = TRUE
   │     └─→ PROCEED TO: Final Status
   │
   └─ FINAL STATUS DETERMINATION
      │
      ├─ CHECK: Critical steps completed?
      │  • billing_configured = TRUE?
      │  • campaign_scheduled = TRUE?
      │  • tablet_queued = TRUE?
      │  • am_notified = TRUE?
      │
      ├─ IF All Critical = TRUE
      │  │
      │  └─→ STATUS: "HANDOVER_COMPLETE_AUTO"
      │     └─→ Set: handover_status = "SUCCESS"
      │     └─→ Log: handover_log (full success)
      │     └─→ END
      │
      └─ IF Any Critical = FALSE
         │
         └─→ STATUS: "HANDOVER_PARTIAL"
            └─→ Set: handover_status = "PARTIAL_SUCCESS"
            └─→ Log: handover_log (with failures)
            └─→ Log: exception_log for each failure
            └─→ END
```

---

## DT-004: EXCEPTION CLASSIFICATION & ROUTING

**Purpose:** Categorize exceptions by severity and route to appropriate owner

**Trigger:** Exception detected in any workflow

```
START: Exception Detected
│
├─ STEP 1: Capture Exception Details
│  │
│  ├─ Capture:
│  │  • exception_type (billing_error, api_failure, data_missing, etc.)
│  │  • merchant_id
│  │  • workflow_step (where it failed)
│  │  • error_message (technical details)
│  │  • timestamp
│  │
│  └─→ OUTPUT: exception_data
│
├─ STEP 2: Classify Exception Type
│  │
│  ├─ Exception Categories:
│  │
│  │  TYPE 1: BILLING_ERROR
│  │  • Commission not applied
│  │  • Billing API failure
│  │  • Payment method error
│  │  → Owner: Finance Ops
│  │
│  │  TYPE 2: CAMPAIGN_FAILURE
│  │  • Campaign not scheduled
│  │  • Discount code invalid
│  │  • Campaign API timeout
│  │  → Owner: Campaign Ops
│  │
│  │  TYPE 3: MISSING_DATA
│  │  • Mandatory fields incomplete
│  │  • Merchant profile missing info
│  │  • Contract terms unclear
│  │  → Owner: Sales Ops
│  │
│  │  TYPE 4: API_FAILURE
│  │  • Tablet system down
│  │  • External API 500 error
│  │  • Network timeout
│  │  → Owner: Engineering
│  │
│  │  TYPE 5: CONTRACT_DISCREPANCY
│  │  • Verbal ≠ written terms
│  │  • Unresolved audit findings
│  │  → Owner: Sales Ops + AM
│  │
│  └─→ OUTPUT: exception_type
│
├─ STEP 3: Assess Business Impact (Severity)
│  │
│  ├─ Severity Assessment:
│  │
│  │  P0 - CRITICAL (Revenue Impact):
│  │  • Partner cannot go live
│  │  • Billing misconfiguration (revenue loss)
│  │  • System-wide outage
│  │  → SLA: 2 hours
│  │  → Notify: Immediate (Slack + Phone)
│  │
│  │  P1 - HIGH (Partner Experience):
│  │  • Campaign not applied
│  │  • Tablet activation failed
│  │  • Contract discrepancy (HIGH severity)
│  │  → SLA: 8 hours
│  │  → Notify: Slack + Email
│  │
│  │  P2 - MEDIUM (Data Quality):
│  │  • Missing non-critical data
│  │  • Low confidence fields
│  │  • Minor discrepancies
│  │  → SLA: 24 hours
│  │  → Notify: Email (daily digest)
│  │
│  └─→ OUTPUT: severity_level (P0/P1/P2)
│
├─ STEP 4: Route to Owner
│  │
│  ├─ Routing Matrix:
│  │
│  │  ┌──────────────────┬──────────────┬──────────┬─────────────┐
│  │  │ Exception Type   │ Owner        │ Severity │ SLA         │
│  │  ├──────────────────┼──────────────┼──────────┼─────────────┤
│  │  │ BILLING_ERROR    │ Finance Ops  │ P0       │ 2h          │
│  │  │ CAMPAIGN_FAILURE │ Campaign Ops │ P1       │ 8h          │
│  │  │ MISSING_DATA     │ Sales Ops    │ P2       │ 24h         │
│  │  │ API_FAILURE      │ Engineering  │ P0       │ 2h          │
│  │  │ CONTRACT_DISCREP │ Sales Ops+AM │ P1       │ 8h (24h L)  │
│  │  └──────────────────┴──────────────┴──────────┴─────────────┘
│  │
│  └─→ ASSIGN: exception to owner
│
├─ STEP 5: Create Ticket + Notify
│  │
│  ├─ Create Ticket in Salesforce:
│  │  • Title: "[{severity}] {exception_type} - {merchant_name}"
│  │  • Description: Full exception details
│  │  • Assigned To: Owner (from routing matrix)
│  │  • SLA: Based on severity
│  │  • Priority: P0/P1/P2
│  │
│  ├─ Send Notification:
│  │  │
│  │  ├─ IF severity = P0
│  │  │  └─→ Slack (immediate) + Email + SMS (on-call)
│  │  │
│  │  ├─ IF severity = P1
│  │  │  └─→ Slack + Email
│  │  │
│  │  └─ IF severity = P2
│  │     └─→ Email (daily digest at 09:00 CET)
│  │
│  └─→ Log: exception_log table
│
└─ STEP 6: Add to Daily Exception Report
   │
   └─→ Aggregate: All exceptions from last 24h
      └─→ Generate: Daily report (sent 09:00 CET)
      └─→ END
```

---

## DT-005: TT21 MONITORING - INTERVENTION LOGIC

**Purpose:** Trigger proactive AM interventions based on order progress

**Trigger:** Daily batch process (runs 06:00 CET)

```
START: Daily TT21 Monitoring Run
│
├─ STEP 1: Query Active Partners
│  │
│  ├─ SELECT: All merchants where
│  │  • go_live_date <= TODAY - 1 (went live at least yesterday)
│  │  • tt21_status != "ACHIEVED"
│  │  • days_since_go_live <= 25
│  │
│  └─→ OUTPUT: active_partners list
│
├─ FOR EACH Partner in active_partners:
│  │
│  ├─ STEP 2: Calculate Current Metrics
│  │  │
│  │  ├─ Query: order_events table
│  │  ├─ Calculate:
│  │  │  • days_since_go_live = TODAY - go_live_date
│  │  │  • current_order_count = COUNT(orders)
│  │  │  • orders_per_day_avg = current_order_count / days_since_go_live
│  │  │
│  │  └─→ OUTPUT: current_metrics
│  │
│  ├─ STEP 3: Determine Status
│  │  │
│  │  ├─ IF current_order_count >= 21
│  │  │  │
│  │  │  └─→ STATUS: "TT21_ACHIEVED"
│  │  │     │
│  │  │     ├─ Calculate: actual_tt21 = days to reach 21st order
│  │  │     ├─ Update: merchant record with success
│  │  │     ├─ Send: Success notification to AM
│  │  │     │
│  │  │     └─→ CELEBRATE
│  │  │        │
│  │  │        ├─ Message to AM:
│  │  │        │  "🎉 SUCCESS: {merchant_name} achieved 21 orders in {actual_tt21} days!"
│  │  │        │
│  │  │        └─→ Consider: WhatsApp congratulations to merchant
│  │  │           └─→ END (no further monitoring needed)
│  │  │
│  │  └─ IF current_order_count < 21
│  │     │
│  │     └─→ PROCEED TO: Risk Assessment
│  │
│  ├─ STEP 4: Risk Assessment
│  │  │
│  │  ├─ Calculate Expected Progress:
│  │  │  • Target: 21 orders in 21 days = 1 order/day
│  │  │  • Expected orders by today = days_since_go_live × 1
│  │  │
│  │  ├─ CHECK: On Track?
│  │  │  │
│  │  │  ├─ IF current_order_count >= expected_orders
│  │  │  │  │
│  │  │  │  └─→ STATUS: "ON_TRACK" 🟢
│  │  │  │     └─→ No action needed
│  │  │  │     └─→ END (continue monitoring)
│  │  │  │
│  │  │  ├─ ELIF days_since_go_live >= 18 AND current_order_count < 18
│  │  │  │  │
│  │  │  │  └─→ STATUS: "AT_RISK" 🟡
│  │  │  │     │
│  │  │  │     └─→ TRIGGER: Early Warning Alert
│  │  │  │        │
│  │  │  │        ├─ Calculate:
│  │  │  │        │  • orders_behind = expected_orders - current_order_count
│  │  │  │        │  • daily_orders_needed = (21 - current_order_count) / (21 - days_since_go_live)
│  │  │  │        │
│  │  │  │        ├─ Send to AM:
│  │  │  │        │  "⚠️ AT RISK: {merchant_name}
│  │  │  │        │   • Days: D+{days_since_go_live}
│  │  │  │        │   • Orders: {current_order_count}/21 ({orders_behind} behind)
│  │  │  │        │   • Needs: {daily_orders_needed} orders/day to hit target
│  │  │  │        │
│  │  │  │        │   SUGGESTED ACTIONS:
│  │  │  │        │   □ Call merchant to check menu quality
│  │  │  │        │   □ Review delivery zone optimization
│  │  │  │        │   □ Check pricing vs competitors
│  │  │  │        │   □ Verify campaign is active"
│  │  │  │        │
│  │  │  │        └─→ Log: intervention_log
│  │  │  │           └─→ END
│  │  │  │
│  │  │  └─ ELIF days_since_go_live >= 21 AND current_order_count < 21
│  │  │     │
│  │  │     └─→ STATUS: "FAILED_TT21" 🔴
│  │  │        │
│  │  │        └─→ TRIGGER: Escalation Protocol
│  │  │           │
│  │  │           ├─ Send to AM:
│  │  │           │  "🚨 URGENT: {merchant_name} DID NOT achieve TT21
│  │  │           │   • Days: D+{days_since_go_live}
│  │  │           │   • Orders: {current_order_count}/21
│  │  │           │   • Status: HIGH CHURN RISK
│  │  │           │
│  │  │           │   REQUIRED ACTIONS:
│  │  │           │   ☑️ Schedule call TODAY
│  │  │           │   ☑️ Root cause analysis
│  │  │           │   ☑️ Intervention plan
│  │  │           │   ☑️ Update CRM notes"
│  │  │           │
│  │  │           ├─ Create: High-priority task in CRM
│  │  │           ├─ Notify: AM Team Lead (escalation)
│  │  │           ├─ Flag: merchant for churn prediction model
│  │  │           │
│  │  │           └─→ Log: intervention_log + churn_risk_log
│  │  │              └─→ END
│  │  │
│  │  └─→ Continue to next partner
│  │
│  └─ END FOR EACH
│
└─ STEP 5: Generate Daily TT21 Summary Report
   │
   ├─ Aggregate Counts:
   │  • total_active_partners
   │  • on_track_count (🟢)
   │  • at_risk_count (🟡)
   │  • failed_count (🔴)
   │  • achieved_today_count (🎉)
   │
   ├─ Send to AM Leadership:
   │  "📊 DAILY TT21 REPORT - {date}
   │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━
   │   🟢 On Track: {on_track_count}
   │   🟡 At Risk: {at_risk_count} (need attention)
   │   🔴 Failed: {failed_count} (urgent intervention)
   │   🎉 Achieved Today: {achieved_today_count}
   │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━
   │   [View Full Dashboard]"
   │
   └─→ END OF MONITORING RUN
```

---

## DT-006: MANUAL REVIEW QUEUE - PRIORITY ASSIGNMENT

**Purpose:** Prioritize manual review tasks for Sales Ops team

**Trigger:** Low-confidence extraction flagged for review

```
START: Manual Review Request Created
│
├─ STEP 1: Capture Review Request Details
│  │
│  ├─ Input:
│  │  • extraction_id
│  │  • merchant_id
│  │  • low_confidence_fields (list)
│  │  • overall_confidence_score
│  │  • merchant_segment (SMB/MM/Enterprise)
│  │  • go_live_date (if contract signed)
│  │
│  └─→ OUTPUT: review_request_data
│
├─ STEP 2: Calculate Priority Score
│  │
│  ├─ FACTOR 1: Time Urgency
│  │  │
│  │  ├─ IF go_live_date defined:
│  │  │  • days_until_go_live = go_live_date - TODAY
│  │  │  │
│  │  │  ├─ IF days_until_go_live <= 1
│  │  │  │  └─→ Urgency Score: 100 (CRITICAL)
│  │  │  │
│  │  │  ├─ ELIF days_until_go_live <= 3
│  │  │  │  └─→ Urgency Score: 75 (HIGH)
│  │  │  │
│  │  │  ├─ ELIF days_until_go_live <= 7
│  │  │  │  └─→ Urgency Score: 50 (MEDIUM)
│  │  │  │
│  │  │  └─ ELSE
│  │  │     └─→ Urgency Score: 25 (LOW)
│  │  │
│  │  └─ IF go_live_date NOT defined:
│  │     └─→ Urgency Score: 10 (Pre-contract, low urgency)
│  │
│  ├─ FACTOR 2: Merchant Value (Segment)
│  │  │
│  │  ├─ IF segment = "Enterprise"
│  │  │  └─→ Value Score: 100
│  │  │
│  │  ├─ ELIF segment = "Mid-Market"
│  │  │  └─→ Value Score: 50
│  │  │
│  │  └─ ELIF segment = "SMB"
│  │     └─→ Value Score: 25
│  │
│  ├─ FACTOR 3: Data Completeness
│  │  │
│  │  ├─ critical_fields_missing = COUNT(low_confidence_fields ∩ mandatory_fields)
│  │  │
│  │  ├─ IF critical_fields_missing > 0
│  │  │  └─→ Completeness Score: 100 (blocking fields)
│  │  │
│  │  └─ ELSE
│  │     └─→ Completeness Score: overall_confidence_score (inverted)
│  │        • e.g., 70% confidence → 30 completeness score
│  │
│  ├─ CALCULATE: Total Priority Score
│  │  │
│  │  └─→ priority_score = (Urgency × 0.5) + (Value × 0.2) + (Completeness × 0.3)
│  │     • Range: 0-100
│  │
│  └─→ OUTPUT: priority_score
│
├─ STEP 3: Assign Priority Label
│  │
│  ├─ IF priority_score >= 80
│  │  │
│  │  └─→ Priority: "URGENT" 🔴
│  │     • SLA: 2 hours
│  │     • Notify: Immediate (Slack + assign automatically)
│  │
│  ├─ ELIF priority_score >= 50
│  │  │
│  │  └─→ Priority: "HIGH" 🟡
│  │     • SLA: 8 hours
│  │     • Notify: Slack (next available reviewer)
│  │
│  ├─ ELIF priority_score >= 25
│  │  │
│  │  └─→ Priority: "MEDIUM" 🟢
│  │     • SLA: 24 hours
│  │     • Notify: Email (daily digest)
│  │
│  └─ ELSE (priority_score < 25)
│     │
│     └─→ Priority: "LOW" ⚪
│        • SLA: 48 hours
│        • Notify: Weekly digest
│
├─ STEP 4: Assign to Reviewer
│  │
│  ├─ Query: Sales Ops team availability
│  │
│  ├─ Balancing Logic:
│  │  • current_queue_size per reviewer
│  │  • reviewer_specialization (if applicable)
│  │  • last_assignment_time (round-robin)
│  │
│  ├─ IF Priority = URGENT
│  │  └─→ Assign: Next available reviewer (interrupt current work)
│  │
│  └─ ELSE
│     └─→ Assign: Round-robin with queue balancing
│
├─ STEP 5: Create Review Task
│  │
│  ├─ Create in Salesforce:
│  │  • Title: "[{priority}] Review Extraction - {merchant_name}"
│  │  • Assigned To: {reviewer_name}
│  │  • SLA: {sla_hours}h
│  │  • Priority: {priority_label}
│  │
│  └─→ Send Notification to Reviewer
│     │
│     ├─ Include:
│     │  • Merchant name + segment
│     │  • Low confidence fields (list)
│     │  • Link to call transcript
│     │  • Link to extracted data (review interface)
│     │  • Urgency reason (e.g., "Go-Live in 2 days")
│     │
│     └─→ Log: review_queue table
│
└─ STEP 6: Monitor SLA Compliance
   │
   ├─ Daily Check (runs 12:00 CET):
   │  │
   │  └─→ FOR EACH review_request WHERE status = "PENDING":
   │     │
   │     ├─ Calculate: time_in_queue = NOW - created_at
   │     │
   │     ├─ IF time_in_queue > (sla_hours × 0.9)
   │     │  │
   │     │  └─→ ALERT: SLA Breach Imminent
   │     │     • Notify: Reviewer + Sales Ops Manager
   │     │     • Escalate: If still not complete at SLA expiry
   │     │
   │     └─→ Continue to next request
   │
   └─→ END
```

---

## SUMMARY: DECISION TREE RELATIONSHIPS

```
┌─────────────────────────────────────────────────────────┐
│                    WORKFLOW FLOW                        │
│                                                          │
│  Call Upload → AI Extraction → DT-001 (Hard Gate #1)   │
│                                   │                      │
│                      ┌─────────────┴─────────────┐      │
│                      │                           │      │
│                   PASS                         FAIL     │
│                      │                           │      │
│                      ↓                           ↓      │
│           Contract Generation          Retry Intelligence│
│                      │                      (DT-006)    │
│                      ↓                                   │
│              Contract Signed                            │
│                      │                                   │
│                      ↓                                   │
│            DT-002 (Contract Audit)                      │
│                      │                                   │
│             ┌────────┴────────┐                        │
│             │                 │                         │
│        Discrepancies       No Issues                    │
│        (Route by severity)     │                        │
│             │                  │                         │
│             │                  ↓                         │
│             │         DT-003 (Handover Routing)        │
│             │                  │                         │
│             │         ┌────────┴────────┐              │
│             │         │                 │               │
│             │        SMB           MM/Enterprise       │
│             │         │           (Phase 2)            │
│             │         ↓                                │
│             │   Automation Steps                       │
│             │   (with error handling)                  │
│             │         │                                │
│             │         ↓                                │
│             │   DT-004 (Exception                      │
│             │         Classification)                  │
│             │         │                                │
│             └─────────┴──→ Exception Log               │
│                             │                          │
│                             ↓                          │
│                      Daily Report (09:00)             │
│                                                        │
│             Post-Go-Live Monitoring:                  │
│                      │                                │
│                      ↓                                │
│            DT-005 (TT21 Monitoring)                  │
│                      │                                │
│                      ↓                                │
│              AM Intervention Alerts                   │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

---

**END OF DECISION TREES DOCUMENT**
