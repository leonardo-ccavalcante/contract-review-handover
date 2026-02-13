import type { AIExtraction } from '../db';
import { VALIDATION_CONFIG } from '../utils/validationRules';
import type { ValidationResult } from '../types/validation.types';

/**
 * MandatoryFieldsService
 *
 * Validates that all required fields are present in the AI extraction.
 * Based on DT-001 (Hard Gate #1) mandatory fields requirements.
 */
export class MandatoryFieldsService {
  /**
   * Validates that all mandatory fields are present and populated
   *
   * @param extraction - AI extraction data
   * @returns Validation result with missing fields list
   */
  validateMandatoryFields(extraction: AIExtraction): ValidationResult {
    const missingFields: string[] = [];

    // Check contract terms fields
    for (const field of VALIDATION_CONFIG.MANDATORY_FIELDS.contract_terms) {
      const fieldValue = extraction.contract_terms[field];

      if (!fieldValue || fieldValue.value === null || fieldValue.value === undefined || fieldValue.value === '') {
        missingFields.push(`contract_terms.${field}`);
      }
    }

    // Check business context arrays (must have at least 1 item)
    if (
      !extraction.business_context.merchant_goals ||
      !Array.isArray(extraction.business_context.merchant_goals) ||
      extraction.business_context.merchant_goals.length < 1
    ) {
      missingFields.push('business_context.merchant_goals');
    }

    if (
      !extraction.business_context.competitors ||
      !Array.isArray(extraction.business_context.competitors) ||
      extraction.business_context.competitors.length < 1
    ) {
      missingFields.push('business_context.competitors');
    }

    return {
      allFieldsPresent: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Get human-readable field names for error messages
   */
  getFieldDisplayName(fieldPath: string): string {
    const displayNames: Record<string, string> = {
      'contract_terms.merchant_name': 'Merchant Name',
      'contract_terms.commission_percentage': 'Commission Percentage',
      'contract_terms.campaign_type': 'Campaign Type',
      'contract_terms.campaign_duration': 'Campaign Duration',
      'contract_terms.tablet_included': 'Tablet Included',
      'contract_terms.contract_length': 'Contract Length',
      'business_context.merchant_goals': 'Merchant Goals (at least 1)',
      'business_context.competitors': 'Competitors (at least 1)',
    };

    return displayNames[fieldPath] || fieldPath;
  }
}
