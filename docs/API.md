# API Documentation

## tRPC Endpoints

All endpoints are available under `/trpc` and follow the tRPC protocol.

### Authentication

All endpoints require authentication via headers:
```typescript
headers: {
  'x-user-id': 'user-uuid',
  'x-user-role': 'Sales Manager',
  'x-user-email': 'user@bolt.eu'
}
```

---

## Validation Router (`/trpc/validation`)

### Execute Hard Gate Validation

**Endpoint**: `validation.executeHardGate`
**Type**: Mutation
**Auth**: Protected (requires authentication)

Executes the Hard Gate #1 validation logic (DT-001) for an AI extraction.

**Input**:
```typescript
{
  extractionId: string;  // UUID of AI extraction
}
```

**Output**:
```typescript
{
  success: boolean;
  validation: ValidationLog;
}
```

**Example**:
```typescript
const result = await trpc.validation.executeHardGate.mutate({
  extractionId: 'abc123-def456-...',
});
```

---

### Get Validation

**Endpoint**: `validation.getValidation`
**Type**: Query
**Auth**: Protected

Retrieves a single validation by ID.

**Input**:
```typescript
{
  validationId: string;
}
```

**Output**:
```typescript
ValidationLog
```

**Example**:
```typescript
const validation = await trpc.validation.getValidation.query({
  validationId: 'validation-uuid',
});
```

---

### List Validations

**Endpoint**: `validation.listValidations`
**Type**: Query
**Auth**: Protected

Lists validations with optional filters.

**Input**:
```typescript
{
  status?: 'PASS' | 'FAIL' | 'MANUAL_REVIEW' | 'OVERRIDE';
  merchantId?: string;
  limit?: number;    // Default: 50, Max: 100
  offset?: number;   // Default: 0
}
```

**Output**:
```typescript
ValidationLog[]
```

**Example**:
```typescript
const validations = await trpc.validation.listValidations.query({
  status: 'MANUAL_REVIEW',
  limit: 20,
});
```

---

### Request Override

**Endpoint**: `validation.requestOverride`
**Type**: Mutation
**Auth**: Sales Manager (role-based)

Overrides a failed validation. Requires Sales Manager or Regional Director role.

**Input**:
```typescript
{
  validationId: string;
  justification: string;  // Minimum 50 characters
}
```

**Output**:
```typescript
{
  success: boolean;
  validation: ValidationLog;
}
```

**Example**:
```typescript
const result = await trpc.validation.requestOverride.mutate({
  validationId: 'validation-uuid',
  justification: 'Merchant has provided additional documentation via email that confirms commission percentage. Approved to proceed.',
});
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User doesn't have Sales Manager role
- `BAD_REQUEST`: Justification too short (<50 characters)
- `NOT_FOUND`: Validation not found

---

## Reports Router (`/trpc/reports`)

### Get Daily Report

**Endpoint**: `reports.getDailyReport`
**Type**: Query
**Auth**: Protected

Retrieves validation statistics for a specific date.

**Input**:
```typescript
{
  date?: string;  // ISO date string (defaults to today)
}
```

**Output**:
```typescript
{
  date: string;
  total_validations: number;
  passed: number;
  failed: number;
  manual_review: number;
  overridden: number;
  pass_rate: number;
  stats: Array<{ status: string; count: number }>;
}
```

**Example**:
```typescript
const report = await trpc.reports.getDailyReport.query({
  date: '2026-02-12',
});
```

---

### Get Validation Statistics

**Endpoint**: `reports.getValidationStats`
**Type**: Query
**Auth**: Protected

Retrieves aggregated validation statistics for a period.

**Input**:
```typescript
{
  days?: number;  // Default: 7, Min: 1, Max: 90
}
```

**Output**:
```typescript
{
  period_days: number;
  start_date: string;
  total_validations: number;
  by_status: Array<{ status: string; count: number }>;
}
```

**Example**:
```typescript
const stats = await trpc.reports.getValidationStats.query({
  days: 30,
});
```

---

### Get Most Common Missing Fields

**Endpoint**: `reports.getMostCommonMissingFields`
**Type**: Query
**Auth**: Protected

Identifies the most frequently missing fields in validations.

**Input**:
```typescript
{
  days?: number;   // Default: 30, Min: 1, Max: 90
  limit?: number;  // Default: 10, Min: 1, Max: 50
}
```

**Output**:
```typescript
{
  period_days: number;
  most_common_missing_fields: Array<{
    field: string;
    count: number;
  }>;
}
```

**Example**:
```typescript
const missingFields = await trpc.reports.getMostCommonMissingFields.query({
  days: 30,
  limit: 10,
});
```

---

## Data Types

### ValidationLog

```typescript
{
  validation_id: string;
  extraction_id: string;
  merchant_id: string;
  validation_status: 'PASS' | 'FAIL' | 'MANUAL_REVIEW' | 'OVERRIDE';
  validation_timestamp: Date;
  mandatory_fields_complete: boolean;
  ai_confidence_threshold_met: boolean;
  missing_fields: string[] | null;
  low_confidence_fields: string[] | null;
  next_action: 'PROCEED_TO_CONTRACT' | 'ROUTE_TO_SALES_OPS' | 'BLOCK' | 'GENERATE_RETRY_INTEL';
  blocking_reasons: string[] | null;
  override_by: string | null;
  override_justification: string | null;
  override_timestamp: Date | null;
  created_at: Date;
}
```

### AIExtraction

```typescript
{
  extraction_id: string;
  call_id: string;
  merchant_id: string;
  extracted_at: Date;
  ai_model: string;
  ai_model_version: string | null;
  processing_time_ms: number | null;
  confidence_score_overall: number;  // 0-100
  contract_terms: {
    [field: string]: { value: any; confidence: number };
  };
  business_context: {
    [field: string]: { value: any; confidence: number } | any;
  };
  owner_profile: Record<string, any> | null;
  market_intelligence: Record<string, any> | null;
  requires_manual_review: boolean;
  low_confidence_fields: string[] | null;
  created_at: Date;
}
```

---

## Error Handling

All tRPC endpoints follow standard error codes:

- **400 BAD_REQUEST**: Invalid input
- **401 UNAUTHORIZED**: Not authenticated
- **403 FORBIDDEN**: Insufficient permissions
- **404 NOT_FOUND**: Resource not found
- **500 INTERNAL_SERVER_ERROR**: Server error

**Error Response Format**:
```typescript
{
  error: {
    code: 'UNAUTHORIZED',
    message: 'User not authenticated'
  }
}
```

---

## Rate Limiting

No rate limiting currently implemented. Consider adding for production:
- Validation executions: 10/minute per user
- Report queries: 30/minute per user

---

## Webhooks (Future)

Planned webhook support for:
- Validation completed
- Manual review assigned
- Override requested

---

For questions or issues, contact the development team.
