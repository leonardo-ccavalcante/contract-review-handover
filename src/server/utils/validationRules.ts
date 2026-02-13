/**
 * Validation Rules Configuration
 * Based on DT-001 (Hard Gate #1) from decision trees documentation
 */

export const VALIDATION_CONFIG = {
  // AI Confidence Threshold (from DT-001, line 81)
  CONFIDENCE_THRESHOLD: 90,

  // Sales Ops SLA (from DT-001, line 100)
  SALES_OPS_SLA_HOURS: 2,

  // Mandatory Fields (from DT-001, lines 50-77)
  MANDATORY_FIELDS: {
    contract_terms: [
      'merchant_name',
      'commission_percentage',
      'campaign_type',
      'campaign_duration',
      'tablet_included',
      'contract_length',
    ],
    business_context: {
      merchant_goals: { minLength: 1 },
      competitors: { minLength: 1 },
    },
  },

  // Override Requirements (from DT-001, lines 123-152)
  OVERRIDE: {
    MIN_JUSTIFICATION_LENGTH: 50,
    AUTHORIZED_ROLES: ['Sales Manager', 'Regional Director'],
  },
} as const;

export type ValidationConfig = typeof VALIDATION_CONFIG;
