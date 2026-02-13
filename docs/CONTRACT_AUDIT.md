# Contract Audit System (Phase 5)

**AI-Powered Contract Auditor - Discrepancy Detection (DT-002)**

## Overview

The Contract Audit System automatically compares signed contract terms with verbal promises made during sales calls, detecting and routing discrepancies based on business impact severity.

## Features

- **PDF Contract OCR** - Extract text and structured terms from signed PDF contracts
- **AI-Powered Term Extraction** - Use Manus AI to parse contract terms intelligently
- **Discrepancy Detection** - Field-by-field comparison of contract vs. call promises
- **Severity Assessment** - Classify discrepancies as HIGH/MEDIUM/LOW based on business impact
- **Automated Routing** - Route to Sales Ops or urgent escalation based on severity
- **Go-Live Blocking** - HIGH severity discrepancies block merchant go-live
- **Audit Trail** - Complete logging of all audits and resolutions
- **Multi-language UI** - English, Spanish, Estonian support

## Architecture

### Technology Stack

**Backend:**
- **OCR**: pdf.js for text extraction
- **AI**: Manus API (Claude 3.5 Sonnet) for intelligent parsing
- **Database**: MySQL with Drizzle ORM
- **API**: tRPC for type-safe endpoints

**Frontend:**
- **React 19** with TypeScript
- **i18next** for multi-language support
- **TanStack Query** for data fetching

## Decision Tree Logic (DT-002)

### Severity Matrix

#### HIGH Severity (24h SLA, Blocks Go-Live)
- **Commission mismatch** - Revenue impact
- **Contract length mismatch** - >3 months difference
- **Tablet terms mismatch** - Free → Paid change

**Action**: URGENT_ESCALATION → Sales Ops + AM notified immediately

#### MEDIUM Severity (48h SLA, Allows Go-Live with warnings)
- **Campaign duration mismatch** - 1-4 weeks difference
- **Campaign type different** - Similar value but different wording
- **Tablet model different**

**Action**: SALES_OPS_REVIEW → Standard review queue

#### LOW Severity (72h SLA, Allows Go-Live)
- **Minor wording differences** - Same intent
- **Non-material clauses**

**Action**: SALES_OPS_REVIEW → Low-priority review queue

### Routing Flow

```
1. Contract Signed & Uploaded
   ↓
2. OCR Text Extraction
   ↓
3. AI Term Extraction
   ↓
4. Retrieve Call Promises (from ai_extractions table)
   ↓
5. Field-by-Field Comparison
   ↓
6. Severity Assessment
   ↓
7. Routing Decision:
   - No Discrepancies → PASS → Proceed to Handover
   - HIGH Severity → URGENT_ESCALATION → Block Go-Live
   - MEDIUM/LOW → SALES_OPS_REVIEW → Allow Go-Live
   ↓
8. Notifications Sent (Slack + Email)
   ↓
9. Audit Log Created
```

## API Endpoints

### Execute Audit

```typescript
trpc.contractAudit.executeAudit.mutate({
  contractId: 'CNT-12345',
  pdfBase64: 'base64-encoded-pdf-string', // Optional
});
```

**Response:**
```typescript
{
  success: true,
  audit: {
    audit_id: 'AUDIT-67890',
    discrepancies_found: true,
    discrepancy_count: 2,
    highest_severity: 'HIGH',
    action_required: 'URGENT_ESCALATION',
    blocks_go_live: true
  }
}
```

### Get Audit

```typescript
trpc.contractAudit.getAudit.query({
  auditId: 'AUDIT-67890',
});
```

### List Audits

```typescript
trpc.contractAudit.listAudits.query({
  merchantId: 'M-12345', // Optional
  resolutionStatus: 'Pending', // Optional
  discrepanciesFound: true, // Optional
  limit: 50,
  offset: 0,
});
```

### Update Resolution

```typescript
trpc.contractAudit.updateResolution.mutate({
  auditId: 'AUDIT-67890',
  resolutionNotes: 'Contacted merchant, agreed to correct contract terms...',
  resolutionStatus: 'Resolved',
});
```

### Get Statistics

```typescript
trpc.contractAudit.getAuditStats.query({
  days: 30,
});
```

**Response:**
```typescript
{
  period_days: 30,
  total_audits: 150,
  pass_rate: 72.5,
  with_discrepancies: 42,
  by_severity: {
    high: 8,
    medium: 20,
    low: 14
  },
  by_resolution_status: {
    pending: 12,
    in_progress: 8,
    resolved: 22
  }
}
```

## Database Schema

### contract_audit_log

```sql
CREATE TABLE contract_audit_log (
    audit_id VARCHAR(50) PRIMARY KEY,
    contract_id VARCHAR(50) NOT NULL,
    merchant_id VARCHAR(50) NOT NULL,
    source_call_id VARCHAR(50),

    -- Audit Details
    audit_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audited_by ENUM('AI', 'Human') DEFAULT 'AI',
    ai_model VARCHAR(50),

    -- Results
    discrepancies_found BOOLEAN NOT NULL,
    discrepancy_count INT DEFAULT 0,

    -- Discrepancies (JSON)
    discrepancies JSON,
    /*
    [
      {
        "field": "commission",
        "verbal_promise": "10%",
        "contract_term": "12%",
        "call_timestamp": "00:15:32",
        "severity": "HIGH",
        "impact": "Revenue impact, direct revenue loss"
      }
    ]
    */

    -- Routing
    action_required ENUM('NONE', 'SALES_OPS_REVIEW', 'URGENT_ESCALATION'),
    blocks_go_live BOOLEAN DEFAULT FALSE,
    sla_hours INT,

    -- Resolution
    resolution_status ENUM('Pending', 'In Progress', 'Resolved', 'Accepted Risk'),
    resolved_by VARCHAR(50),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (contract_id) REFERENCES contracts(contract_id),
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
);
```

## Frontend Components

### AuditDashboard

Main dashboard for viewing all audits with filtering and statistics.

**Location**: `src/client/components/contractAudit/AuditDashboard.tsx`

**Features**:
- Filter by status, merchant ID
- Display audit statistics
- List all audits with quick overview

### ContractUpload

Upload contract PDF for auditing.

**Location**: `src/client/components/contractAudit/ContractUpload.tsx`

**Features**:
- Contract ID input
- PDF file upload (max 10MB)
- Progress indicator during analysis

### DiscrepancyReport

Detailed view of a single audit with all discrepancies.

**Location**: `src/client/components/contractAudit/DiscrepancyReport.tsx`

**Features**:
- Merchant and contract details
- List of all discrepancies with severity
- Comparison of verbal promise vs. contract term
- Business impact explanation
- Resolution form (if pending)

### ResolutionForm

Form for Sales Ops to update audit resolution.

**Location**: `src/client/components/contractAudit/ResolutionForm.tsx`

**Features**:
- Select resolution status
- Add resolution notes (min 20 characters)
- Submit resolution update

## Services

### OCRService

Extracts text and structured terms from PDF contracts.

**Location**: `src/server/services/OCRService.ts`

**Methods**:
- `extractTextFromPDF(pdfBuffer)` - Extract raw text
- `extractContractTerms(pdfText)` - AI-powered term extraction
- `extractFromPDF(pdfBuffer)` - Combined text + term extraction
- `validateContractTerms(terms)` - Validate completeness

### DiscrepancyDetectionService

Compares contract terms with verbal promises.

**Location**: `src/server/services/DiscrepancyDetectionService.ts`

**Methods**:
- `detectDiscrepancies(contractTerms, verbalPromises, callTranscript)` - Main comparison
- `assessSeverity(discrepancy)` - Severity assessment
- `compareValues(field, contractValue, verbalValue)` - Field comparison

### ContractAuditService

Main orchestrator for the audit process.

**Location**: `src/server/services/ContractAuditService.ts`

**Methods**:
- `executeContractAudit(contractId, pdfBuffer)` - Execute full audit (DT-002)
- `getAudit(auditId)` - Retrieve audit by ID
- `listAudits(filters)` - List audits with filters
- `updateResolution(auditId, resolution)` - Update audit resolution

## Notifications

### Slack Notifications

- **No Discrepancies**: `#sales-ops` - Success notification
- **HIGH Severity**: `#sales-ops` - Immediate urgent notification
- **MEDIUM/LOW Severity**: `#sales-ops` - Standard notification

### Email Notifications

- **HIGH Severity**: Sales Ops + Account Manager
- **MEDIUM/LOW Severity**: Sales Ops team

## Comparison Fields

The system compares these fields:

1. **commission** - Commission percentage (e.g., "12%")
2. **campaign_type** - Campaign description (e.g., "15% discount for 60 days")
3. **campaign_duration** - Campaign duration in days
4. **tablet_included** - Boolean (true/false)
5. **tablet_model** - Tablet model name (e.g., "T-200")
6. **contract_length** - Contract duration in months

## Usage Examples

### Example 1: Upload Contract for Audit

```typescript
// Frontend
const uploadContract = async (contractId: string, pdfFile: File) => {
  // Convert PDF to base64
  const base64 = await fileToBase64(pdfFile);

  // Execute audit
  const result = await trpc.contractAudit.executeAudit.mutate({
    contractId,
    pdfBase64: base64,
  });

  // Navigate to results
  navigate(`/audits/${result.audit.audit_id}`);
};
```

### Example 2: Review Audit and Update Resolution

```typescript
// Sales Ops reviews audit
const audit = await trpc.contractAudit.getAudit.query({
  auditId: 'AUDIT-67890',
});

// Update resolution after investigation
await trpc.contractAudit.updateResolution.mutate({
  auditId: 'AUDIT-67890',
  resolutionNotes: 'Contacted merchant, merchant agreed to sign amendment with correct commission (12%). Amendment sent via DocuSign.',
  resolutionStatus: 'Resolved',
});
```

### Example 3: Monitor Audit Statistics

```typescript
// Dashboard displays stats
const stats = await trpc.contractAudit.getAuditStats.query({
  days: 30,
});

console.log(`Pass Rate: ${stats.pass_rate}%`);
console.log(`High Severity: ${stats.by_severity.high}`);
console.log(`Pending Resolution: ${stats.by_resolution_status.pending}`);
```

## Multi-language Support

Translations available in:
- **English** (`en/contractAudit.json`)
- **Spanish** (`es/contractAudit.json`)
- **Estonian** (`et/contractAudit.json`)

All UI text is fully translated, including:
- Dashboard labels and filters
- Severity levels
- Status labels
- Form labels and help text
- Error messages

## Testing

### Manual Testing Checklist

1. **Upload Contract**
   - [ ] Upload valid PDF contract
   - [ ] Verify file size limit (10MB)
   - [ ] Verify PDF-only restriction
   - [ ] Test with missing contract ID

2. **Audit Execution**
   - [ ] Test with no discrepancies (all match)
   - [ ] Test with HIGH severity discrepancy
   - [ ] Test with MEDIUM severity discrepancy
   - [ ] Test with LOW severity discrepancy
   - [ ] Test with multiple discrepancies

3. **Audit Dashboard**
   - [ ] View all audits
   - [ ] Filter by status
   - [ ] Filter by merchant ID
   - [ ] View audit statistics

4. **Discrepancy Report**
   - [ ] View detailed audit report
   - [ ] Verify all discrepancies displayed
   - [ ] Check severity badges
   - [ ] Verify impact explanations

5. **Resolution**
   - [ ] Submit resolution (Resolved)
   - [ ] Submit resolution (Accepted Risk)
   - [ ] Verify minimum character validation
   - [ ] Verify resolution appears in audit

6. **Multi-language**
   - [ ] Switch to Spanish
   - [ ] Switch to Estonian
   - [ ] Verify all labels translated

## Performance Considerations

- **PDF Processing**: Large PDFs (>5MB) may take 5-10 seconds to process
- **AI Extraction**: Manus API calls typically take 2-5 seconds
- **Discrepancy Detection**: In-memory comparison is instant (<100ms)
- **Database Queries**: Indexed for fast retrieval (<50ms)

## Error Handling

The system handles:
- **Invalid PDF**: Returns error, prompts re-upload
- **Missing Contract**: Returns 404 error
- **AI Extraction Failure**: Logs error, returns structured error message
- **Network Errors**: Automatic retry (3 attempts)

## Monitoring

Key metrics to monitor:
- **Audit Success Rate**: % of successful audits
- **Pass Rate**: % of audits with no discrepancies
- **HIGH Severity Count**: Number of urgent escalations
- **Average Resolution Time**: Time to resolve pending audits
- **Most Common Discrepancy Fields**: Which fields fail most often

## Future Enhancements

1. **Automated Contract Amendment Generation** - Generate contract amendments for discrepancies
2. **ML Model Training** - Train custom model on discrepancy patterns
3. **Bulk Audit Processing** - Process multiple contracts at once
4. **Webhook Integration** - Real-time notifications to external systems
5. **Advanced Analytics** - Predictive analytics for discrepancy likelihood

---

**Implementation Status**: ✅ Complete (Phase 5)

**Last Updated**: 2026-02-12
