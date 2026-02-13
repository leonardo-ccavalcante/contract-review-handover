import { logger } from '../utils/logger';
import { ManusAIService } from './ManusAIService';

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Discrepancy {
  field: string;
  verbal_promise: string;
  contract_term: string;
  call_timestamp: string;
  severity: Severity;
  impact: string;
}

export interface DiscrepancyDetectionResult {
  discrepancies_found: boolean;
  discrepancy_count: number;
  discrepancies: Discrepancy[];
  highest_severity: Severity | null;
}

/**
 * Discrepancy Detection Service - Compare contract terms with call promises
 *
 * Implements DT-002 logic for field-by-field comparison
 */
export class DiscrepancyDetectionService {
  private manusAI: ManusAIService;

  constructor() {
    this.manusAI = new ManusAIService();
  }

  /**
   * Compare contract terms with verbal promises from call
   * @param contractTerms - Terms extracted from signed contract
   * @param verbalPromises - Terms from AI extraction of call
   * @param callTranscript - Full call transcript for timestamp extraction
   * @returns Discrepancy detection result
   */
  async detectDiscrepancies(
    contractTerms: {
      commission: string | null;
      campaign_type: string | null;
      campaign_duration: number | null;
      tablet_included: boolean | null;
      tablet_model: string | null;
      contract_length: number | null;
    },
    verbalPromises: {
      commission_percentage?: { value: string; confidence: number };
      campaign_type?: { value: string; confidence: number };
      campaign_duration?: { value: number; confidence: number };
      tablet_included?: { value: boolean; confidence: number };
      tablet_model?: { value: string; confidence: number };
      contract_length?: { value: number; confidence: number };
    },
    callTranscript?: string
  ): Promise<DiscrepancyDetectionResult> {
    logger.info('Starting discrepancy detection');

    const discrepancies: Discrepancy[] = [];

    // Field-by-field comparison
    const fieldsToCompare = [
      'commission',
      'campaign_type',
      'campaign_duration',
      'tablet_included',
      'tablet_model',
      'contract_length',
    ];

    for (const field of fieldsToCompare) {
      const contractValue = contractTerms[field as keyof typeof contractTerms];
      const verbalValue = verbalPromises[
        `${field}${field === 'commission' ? '_percentage' : ''}` as keyof typeof verbalPromises
      ]?.value;

      // Skip if either value is missing
      if (
        contractValue === null ||
        contractValue === undefined ||
        verbalValue === null ||
        verbalValue === undefined
      ) {
        continue;
      }

      // Compare values
      const mismatch = this.compareValues(field, contractValue, verbalValue);

      if (mismatch) {
        // Find timestamp in transcript
        const timestamp = callTranscript
          ? await this.findTimestampInTranscript(
              field,
              String(verbalValue),
              callTranscript
            )
          : 'Unknown';

        const discrepancy: Discrepancy = {
          field,
          verbal_promise: String(verbalValue),
          contract_term: String(contractValue),
          call_timestamp: timestamp,
          severity: 'MEDIUM', // Will be assessed next
          impact: '', // Will be assessed next
        };

        discrepancies.push(discrepancy);
      }
    }

    // Assess severity for each discrepancy
    for (const discrepancy of discrepancies) {
      const { severity, impact } = this.assessSeverity(discrepancy);
      discrepancy.severity = severity;
      discrepancy.impact = impact;
    }

    // Determine highest severity
    const highestSeverity = this.getHighestSeverity(discrepancies);

    logger.info('Discrepancy detection complete', {
      discrepancies_found: discrepancies.length > 0,
      discrepancy_count: discrepancies.length,
      highest_severity: highestSeverity,
    });

    return {
      discrepancies_found: discrepancies.length > 0,
      discrepancy_count: discrepancies.length,
      discrepancies,
      highest_severity: highestSeverity,
    };
  }

  /**
   * Compare two values for a specific field
   * @param field - Field name
   * @param contractValue - Value from contract
   * @param verbalValue - Value from call
   * @returns true if values mismatch
   */
  private compareValues(
    field: string,
    contractValue: any,
    verbalValue: any
  ): boolean {
    // Normalize values for comparison
    const normalizeValue = (val: any): string => {
      if (typeof val === 'boolean') return val.toString();
      if (typeof val === 'number') return val.toString();
      if (typeof val === 'string')
        return val.toLowerCase().trim().replace(/\s+/g, ' ');
      return String(val);
    };

    const contractNormalized = normalizeValue(contractValue);
    const verbalNormalized = normalizeValue(verbalValue);

    // Special handling for commission percentages
    if (field === 'commission') {
      // Extract numeric values
      const contractPercent = parseFloat(contractNormalized.replace(/[^0-9.]/g, ''));
      const verbalPercent = parseFloat(verbalNormalized.replace(/[^0-9.]/g, ''));

      return contractPercent !== verbalPercent;
    }

    // Special handling for durations (allow small differences)
    if (field === 'campaign_duration' || field === 'contract_length') {
      const contractNum = parseFloat(contractNormalized);
      const verbalNum = parseFloat(verbalNormalized);

      // Allow 1-day or 1-month difference (tolerance)
      const tolerance = field === 'campaign_duration' ? 1 : 0; // days for campaign, exact for contract
      return Math.abs(contractNum - verbalNum) > tolerance;
    }

    // Special handling for booleans
    if (field === 'tablet_included') {
      return contractNormalized !== verbalNormalized;
    }

    // Special handling for campaign_type (allow similar wording)
    if (field === 'campaign_type') {
      // Use fuzzy matching for campaign descriptions
      const similarity = this.calculateStringSimilarity(
        contractNormalized,
        verbalNormalized
      );
      return similarity < 0.7; // 70% similarity threshold
    }

    // Default: exact match
    return contractNormalized !== verbalNormalized;
  }

  /**
   * Calculate string similarity (Levenshtein distance-based)
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Similarity score (0-1)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Edit distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2[i - 1] === str1[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Assess severity of a discrepancy based on DT-002 severity matrix
   * @param discrepancy - Discrepancy to assess
   * @returns Severity and impact assessment
   */
  private assessSeverity(discrepancy: Discrepancy): {
    severity: Severity;
    impact: string;
  } {
    const { field, verbal_promise, contract_term } = discrepancy;

    // HIGH SEVERITY - DT-002 lines 220-224
    if (field === 'commission') {
      return {
        severity: 'HIGH',
        impact: 'Commission mismatch (revenue impact). Direct revenue loss and likely escalation.',
      };
    }

    if (field === 'contract_length') {
      // Check if difference is >3 months
      const verbalMonths = parseInt(verbal_promise);
      const contractMonths = parseInt(contract_term);
      const difference = Math.abs(verbalMonths - contractMonths);

      if (difference > 3) {
        return {
          severity: 'HIGH',
          impact: `Contract length mismatch (${difference} months difference). Likely escalation.`,
        };
      } else {
        return {
          severity: 'MEDIUM',
          impact: `Contract length mismatch (${difference} months difference). Moderate escalation risk.`,
        };
      }
    }

    if (field === 'tablet_included') {
      // Check if free → paid change
      const verbalFree =
        verbal_promise === 'true' || verbal_promise.toLowerCase() === 'free';
      const contractPaid =
        contract_term === 'false' || contract_term.toLowerCase() === 'paid';

      if (verbalFree && contractPaid) {
        return {
          severity: 'HIGH',
          impact: 'Tablet terms mismatch (promised free, contract shows paid). Likely escalation.',
        };
      }
    }

    // MEDIUM SEVERITY - DT-002 lines 226-230
    if (field === 'campaign_duration') {
      const verbalDays = parseInt(verbal_promise);
      const contractDays = parseInt(contract_term);
      const difference = Math.abs(verbalDays - contractDays);

      if (difference >= 7 && difference <= 28) {
        // 1-4 weeks
        return {
          severity: 'MEDIUM',
          impact: `Campaign duration mismatch (${difference} days difference). Merchant expectation mismatch, moderate escalation risk.`,
        };
      } else if (difference < 7) {
        return {
          severity: 'LOW',
          impact: `Campaign duration mismatch (${difference} days difference). Minor difference, unlikely to cause issues.`,
        };
      }
    }

    if (field === 'campaign_type') {
      return {
        severity: 'MEDIUM',
        impact: 'Campaign type different but similar value. Merchant expectation mismatch, moderate escalation risk.',
      };
    }

    if (field === 'tablet_model') {
      return {
        severity: 'MEDIUM',
        impact: 'Tablet model different from promised. Moderate escalation risk.',
      };
    }

    // LOW SEVERITY - DT-002 lines 232-235
    return {
      severity: 'LOW',
      impact: 'Minor wording differences (same intent). Minimal impact, unlikely to cause escalation.',
    };
  }

  /**
   * Get the highest severity from a list of discrepancies
   * @param discrepancies - List of discrepancies
   * @returns Highest severity level
   */
  private getHighestSeverity(discrepancies: Discrepancy[]): Severity | null {
    if (discrepancies.length === 0) return null;

    const severityOrder: Record<Severity, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    let highestSeverity: Severity = 'LOW';
    let highestValue = 0;

    for (const discrepancy of discrepancies) {
      const value = severityOrder[discrepancy.severity];
      if (value > highestValue) {
        highestValue = value;
        highestSeverity = discrepancy.severity;
      }
    }

    return highestSeverity;
  }

  /**
   * Find timestamp in call transcript where a term was mentioned
   * @param field - Field name
   * @param value - Value to search for
   * @param transcript - Call transcript
   * @returns Timestamp string
   */
  private async findTimestampInTranscript(
    field: string,
    value: string,
    transcript: string
  ): Promise<string> {
    try {
      // Use AI to find the timestamp
      const prompt = `
Find the timestamp in this call transcript where "${field}" with value "${value}" was discussed:

TRANSCRIPT:
${transcript.slice(0, 5000)} ${transcript.length > 5000 ? '...(truncated)' : ''}

Return ONLY the timestamp in format "MM:SS" or "HH:MM:SS" or "Unknown" if not found.
`;

      const response = await this.manusAI.callAI(prompt);
      const cleanedResponse = response.trim().replace(/[^0-9:]/g, '');

      return cleanedResponse || 'Unknown';
    } catch (error) {
      logger.warn('Failed to find timestamp in transcript', { field, error });
      return 'Unknown';
    }
  }
}
