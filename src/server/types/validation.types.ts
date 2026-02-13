import { z } from 'zod';

// Validation Status Enum
export const ValidationStatus = z.enum(['PASS', 'FAIL', 'MANUAL_REVIEW', 'OVERRIDE']);
export type ValidationStatus = z.infer<typeof ValidationStatus>;

// Next Action Enum
export const NextAction = z.enum([
  'PROCEED_TO_CONTRACT',
  'ROUTE_TO_SALES_OPS',
  'BLOCK',
  'GENERATE_RETRY_INTEL',
]);
export type NextAction = z.infer<typeof NextAction>;

// Field Value with Confidence
export const FieldWithConfidence = z.object({
  value: z.any(),
  confidence: z.number().min(0).max(100),
});
export type FieldWithConfidence = z.infer<typeof FieldWithConfidence>;

// Contract Terms Schema
export const ContractTermsSchema = z.object({
  merchant_name: FieldWithConfidence.optional(),
  commission_percentage: FieldWithConfidence.optional(),
  campaign_type: FieldWithConfidence.optional(),
  campaign_duration: FieldWithConfidence.optional(),
  tablet_included: FieldWithConfidence.optional(),
  tablet_model: FieldWithConfidence.optional(),
  contract_length: FieldWithConfidence.optional(),
});
export type ContractTerms = z.infer<typeof ContractTermsSchema>;

// Business Context Schema
export const BusinessContextSchema = z.object({
  current_revenue: FieldWithConfidence.optional(),
  employee_count: FieldWithConfidence.optional(),
  merchant_goals: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
  expected_order_volume: FieldWithConfidence.optional(),
});
export type BusinessContext = z.infer<typeof BusinessContextSchema>;

// AI Extraction Schema
export const AIExtractionSchema = z.object({
  extraction_id: z.string(),
  call_id: z.string(),
  merchant_id: z.string(),
  extracted_at: z.date(),
  ai_model: z.string(),
  ai_model_version: z.string().optional(),
  processing_time_ms: z.number().optional(),
  confidence_score_overall: z.number().min(0).max(100),
  contract_terms: ContractTermsSchema,
  business_context: BusinessContextSchema,
  owner_profile: z.record(z.any()).optional(),
  market_intelligence: z.record(z.any()).optional(),
  requires_manual_review: z.boolean().default(false),
  low_confidence_fields: z.array(z.string()).optional(),
  created_at: z.date(),
});
export type AIExtraction = z.infer<typeof AIExtractionSchema>;

// Validation Result Schema
export const ValidationResultSchema = z.object({
  allFieldsPresent: z.boolean(),
  missingFields: z.array(z.string()),
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// Confidence Validation Result Schema
export const ConfidenceValidationResultSchema = z.object({
  meetsThreshold: z.boolean(),
  actualScore: z.number(),
  threshold: z.number(),
  lowConfidenceFields: z.array(z.string()),
});
export type ConfidenceValidationResult = z.infer<typeof ConfidenceValidationResultSchema>;

// Validation Log Schema
export const ValidationLogSchema = z.object({
  validation_id: z.string(),
  extraction_id: z.string(),
  merchant_id: z.string(),
  validation_status: ValidationStatus,
  validation_timestamp: z.date(),
  mandatory_fields_complete: z.boolean(),
  ai_confidence_threshold_met: z.boolean(),
  missing_fields: z.array(z.string()).optional(),
  low_confidence_fields: z.array(z.string()).optional(),
  next_action: NextAction,
  blocking_reasons: z.array(z.string()).optional(),
  override_by: z.string().optional(),
  override_justification: z.string().optional(),
  override_timestamp: z.date().optional(),
  created_at: z.date(),
});
export type ValidationLog = z.infer<typeof ValidationLogSchema>;

// Override Request Schema
export const OverrideRequestSchema = z.object({
  validation_id: z.string(),
  override_by: z.string(),
  override_justification: z.string().min(50, 'Justification must be at least 50 characters'),
});
export type OverrideRequest = z.infer<typeof OverrideRequestSchema>;

// Manual Review Update Schema
export const ManualReviewUpdateSchema = z.object({
  validation_id: z.string(),
  reviewed_by: z.string(),
  corrections: z.record(z.any()),
  notes: z.string().optional(),
});
export type ManualReviewUpdate = z.infer<typeof ManualReviewUpdateSchema>;

// Validation Report Schema
export const ValidationReportSchema = z.object({
  date: z.date(),
  total_validations: z.number(),
  passed: z.number(),
  failed: z.number(),
  manual_review: z.number(),
  overridden: z.number(),
  average_confidence: z.number(),
  most_common_missing_fields: z.array(
    z.object({
      field: z.string(),
      count: z.number(),
    })
  ),
});
export type ValidationReport = z.infer<typeof ValidationReportSchema>;
