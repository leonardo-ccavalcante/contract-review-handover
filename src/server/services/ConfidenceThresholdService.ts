import type { AIExtraction } from '../db';
import { VALIDATION_CONFIG } from '../utils/validationRules';
import type { ConfidenceValidationResult } from '../types/validation.types';

/**
 * ConfidenceThresholdService
 *
 * Validates AI confidence scores against the threshold (90%).
 * Identifies fields with low confidence that need manual review.
 * Based on DT-001 (Hard Gate #1) confidence requirements.
 */
export class ConfidenceThresholdService {
  private readonly threshold = VALIDATION_CONFIG.CONFIDENCE_THRESHOLD;

  /**
   * Validates overall and field-level confidence scores
   *
   * @param extraction - AI extraction data
   * @returns Confidence validation result with low confidence fields
   */
  validateConfidence(extraction: AIExtraction): ConfidenceValidationResult {
    const overallScore = Number(extraction.confidence_score_overall);
    const lowConfidenceFields = this.findLowConfidenceFields(extraction);

    return {
      meetsThreshold: overallScore >= this.threshold,
      actualScore: overallScore,
      threshold: this.threshold,
      lowConfidenceFields,
    };
  }

  /**
   * Finds all fields with confidence below threshold
   */
  private findLowConfidenceFields(extraction: AIExtraction): string[] {
    const lowFields: string[] = [];

    // Check contract_terms fields
    if (extraction.contract_terms) {
      for (const [key, value] of Object.entries(extraction.contract_terms)) {
        if (value && typeof value === 'object' && 'confidence' in value) {
          if (value.confidence < this.threshold) {
            lowFields.push(`contract_terms.${key}`);
          }
        }
      }
    }

    // Check business_context fields
    if (extraction.business_context) {
      for (const [key, value] of Object.entries(extraction.business_context)) {
        if (value && typeof value === 'object' && 'confidence' in value) {
          if (value.confidence < this.threshold) {
            lowFields.push(`business_context.${key}`);
          }
        }
      }
    }

    // Check owner_profile fields
    if (extraction.owner_profile) {
      for (const [key, value] of Object.entries(extraction.owner_profile)) {
        if (value && typeof value === 'object' && 'confidence' in value) {
          if (value.confidence < this.threshold) {
            lowFields.push(`owner_profile.${key}`);
          }
        }
      }
    }

    // Check market_intelligence fields
    if (extraction.market_intelligence) {
      for (const [key, value] of Object.entries(extraction.market_intelligence)) {
        if (value && typeof value === 'object' && 'confidence' in value) {
          if (value.confidence < this.threshold) {
            lowFields.push(`market_intelligence.${key}`);
          }
        }
      }
    }

    return lowFields;
  }

  /**
   * Calculate field-level confidence statistics
   */
  getConfidenceStats(extraction: AIExtraction) {
    const scores: number[] = [];

    // Collect all confidence scores
    const collectScores = (obj: any, prefix: string = '') => {
      if (!obj) return;

      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && 'confidence' in value) {
          scores.push(value.confidence);
        }
      }
    };

    collectScores(extraction.contract_terms, 'contract_terms');
    collectScores(extraction.business_context, 'business_context');
    collectScores(extraction.owner_profile, 'owner_profile');
    collectScores(extraction.market_intelligence, 'market_intelligence');

    return {
      total_fields: scores.length,
      average_confidence: scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0,
      min_confidence: scores.length > 0 ? Math.min(...scores) : 0,
      max_confidence: scores.length > 0 ? Math.max(...scores) : 0,
      below_threshold_count: scores.filter(s => s < this.threshold).length,
    };
  }
}
