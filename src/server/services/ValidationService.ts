import { eq } from 'drizzle-orm';
import { db, aiExtractions, validationLog, type ValidationLog } from '../db';
import { MandatoryFieldsService } from './MandatoryFieldsService';
import { ConfidenceThresholdService } from './ConfidenceThresholdService';
import { NotificationService } from './NotificationService';
import type { ValidationStatus, NextAction } from '../types/validation.types';
import { randomUUID } from 'crypto';

/**
 * ValidationService
 *
 * Core business logic for Hard Gate #1 (Pre-Contract Validation).
 * Implements DT-001 decision tree logic.
 */
export class ValidationService {
  private mandatoryFieldsService: MandatoryFieldsService;
  private confidenceThresholdService: ConfidenceThresholdService;
  private notificationService: NotificationService;

  constructor() {
    this.mandatoryFieldsService = new MandatoryFieldsService();
    this.confidenceThresholdService = new ConfidenceThresholdService();
    this.notificationService = new NotificationService();
  }

  /**
   * Execute Hard Gate #1 validation logic (DT-001)
   *
   * Decision Flow:
   * 1. Check mandatory fields → If missing, BLOCK
   * 2. Check AI confidence ≥90% → If low, MANUAL_REVIEW
   * 3. If all pass → PASS
   *
   * @param extractionId - ID of the AI extraction to validate
   * @returns Validation log entry
   */
  async executeHardGate(extractionId: string): Promise<ValidationLog> {
    // 1. Fetch extraction data
    const [extraction] = await db
      .select()
      .from(aiExtractions)
      .where(eq(aiExtractions.extraction_id, extractionId))
      .limit(1);

    if (!extraction) {
      throw new Error(`Extraction not found: ${extractionId}`);
    }

    // 2. Run validation checks
    const mandatoryCheck = this.mandatoryFieldsService.validateMandatoryFields(extraction);
    const confidenceCheck = this.confidenceThresholdService.validateConfidence(extraction);

    // 3. Decision tree logic (DT-001)
    let validationStatus: ValidationStatus;
    let nextAction: NextAction;
    let blockingReasons: string[] = [];

    if (!mandatoryCheck.allFieldsPresent) {
      // Path: Missing mandatory fields → BLOCK
      validationStatus = 'FAIL';
      nextAction = 'BLOCK';
      blockingReasons = mandatoryCheck.missingFields.map(
        field => `Missing required field: ${this.mandatoryFieldsService.getFieldDisplayName(field)}`
      );
    } else if (!confidenceCheck.meetsThreshold) {
      // Path: Low confidence → MANUAL_REVIEW
      validationStatus = 'MANUAL_REVIEW';
      nextAction = 'ROUTE_TO_SALES_OPS';
    } else {
      // Path: All checks passed → PASS
      validationStatus = 'PASS';
      nextAction = 'PROCEED_TO_CONTRACT';
    }

    // 4. Insert validation log
    const validationId = randomUUID();
    const [validationRecord] = await db
      .insert(validationLog)
      .values({
        validation_id: validationId,
        extraction_id: extractionId,
        merchant_id: extraction.merchant_id,
        validation_status: validationStatus,
        validation_timestamp: new Date(),
        mandatory_fields_complete: mandatoryCheck.allFieldsPresent,
        ai_confidence_threshold_met: confidenceCheck.meetsThreshold,
        missing_fields: mandatoryCheck.missingFields,
        low_confidence_fields: confidenceCheck.lowConfidenceFields,
        next_action: nextAction,
        blocking_reasons: blockingReasons.length > 0 ? blockingReasons : null,
        created_at: new Date(),
      })
      .$returningId();

    // 5. Fetch the created record
    const [createdValidation] = await db
      .select()
      .from(validationLog)
      .where(eq(validationLog.validation_id, validationId))
      .limit(1);

    // 6. Send notifications based on next action
    await this.notificationService.sendValidationNotification(
      createdValidation,
      extraction,
      nextAction
    );

    return createdValidation;
  }

  /**
   * Get validation by ID
   */
  async getValidation(validationId: string): Promise<ValidationLog | null> {
    const [validation] = await db
      .select()
      .from(validationLog)
      .where(eq(validationLog.validation_id, validationId))
      .limit(1);

    return validation || null;
  }

  /**
   * List validations with optional filters
   */
  async listValidations(filters?: {
    status?: ValidationStatus;
    merchantId?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = db.select().from(validationLog);

    if (filters?.status) {
      query = query.where(eq(validationLog.validation_status, filters.status)) as any;
    }

    if (filters?.merchantId) {
      query = query.where(eq(validationLog.merchant_id, filters.merchantId)) as any;
    }

    const results = await query.limit(filters?.limit || 50).offset(filters?.offset || 0);

    return results;
  }

  /**
   * Process override request (Sales Manager approval)
   */
  async processOverride(
    validationId: string,
    overrideBy: string,
    justification: string
  ): Promise<ValidationLog> {
    // Validate justification length (min 50 chars)
    if (justification.length < 50) {
      throw new Error('Override justification must be at least 50 characters');
    }

    // Fetch existing validation
    const validation = await this.getValidation(validationId);
    if (!validation) {
      throw new Error(`Validation not found: ${validationId}`);
    }

    // Update validation with override
    await db
      .update(validationLog)
      .set({
        validation_status: 'OVERRIDE',
        next_action: 'PROCEED_TO_CONTRACT',
        override_by: overrideBy,
        override_justification: justification,
        override_timestamp: new Date(),
      })
      .where(eq(validationLog.validation_id, validationId));

    // Fetch updated record
    const [updatedValidation] = await db
      .select()
      .from(validationLog)
      .where(eq(validationLog.validation_id, validationId))
      .limit(1);

    // Send override notification
    await this.notificationService.sendOverrideNotification(updatedValidation, overrideBy);

    return updatedValidation;
  }
}
