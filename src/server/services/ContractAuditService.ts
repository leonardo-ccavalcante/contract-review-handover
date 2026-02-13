import { eq } from 'drizzle-orm';
import { db } from '../db';
import { contractAuditLog } from '../db/schema/contractAuditLog.schema';
import { contracts } from '../db/schema/contracts.schema';
import { aiExtractions } from '../db/schema/aiExtractions.schema';
import { callTranscriptions } from '../db/schema/callTranscriptions.schema';
import { OCRService } from './OCRService';
import { DiscrepancyDetectionService, Severity } from './DiscrepancyDetectionService';
import { NotificationService } from './NotificationService';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Contract Audit Service - Main orchestrator for DT-002 implementation
 *
 * Coordinates PDF extraction, discrepancy detection, severity assessment, and routing
 */
export class ContractAuditService {
  private ocrService: OCRService;
  private discrepancyService: DiscrepancyDetectionService;
  private notificationService: NotificationService;

  constructor() {
    this.ocrService = new OCRService();
    this.discrepancyService = new DiscrepancyDetectionService();
    this.notificationService = new NotificationService();
  }

  /**
   * Execute full contract audit (DT-002)
   * @param contractId - Contract ID to audit
   * @param pdfBuffer - Optional PDF buffer (if not stored in database)
   * @returns Audit result
   */
  async executeContractAudit(
    contractId: string,
    pdfBuffer?: Buffer
  ): Promise<{
    audit_id: string;
    discrepancies_found: boolean;
    discrepancy_count: number;
    highest_severity: Severity | null;
    action_required: 'NONE' | 'SALES_OPS_REVIEW' | 'URGENT_ESCALATION';
    blocks_go_live: boolean;
  }> {
    logger.info('Starting contract audit', { contractId });

    try {
      // STEP 1: Retrieve contract and related data
      const contract = await db.select().from(contracts).where(eq(contracts.contract_id, contractId)).limit(1);

      if (!contract || contract.length === 0) {
        throw new Error(`Contract not found: ${contractId}`);
      }

      const contractData = contract[0];

      // STEP 2: Extract contract terms from PDF
      let contractTerms;
      if (pdfBuffer) {
        contractTerms = await this.ocrService.extractFromPDF(pdfBuffer);
      } else if (contractData.pdf_url || contractData.pdf_storage_path) {
        // In production, fetch PDF from S3/storage
        throw new Error('PDF fetching from storage not yet implemented');
      } else {
        // Use terms already stored in contract table
        contractTerms = {
          commission: contractData.commission,
          campaign_type: contractData.campaign_type,
          campaign_duration: contractData.campaign_duration,
          tablet_included: contractData.tablet_terms?.includes('included') || false,
          tablet_model: null, // Parse from tablet_terms if needed
          contract_length: contractData.contract_length,
        };
      }

      logger.info('Contract terms extracted', { contractTerms });

      // STEP 3: Retrieve call transcript promises
      const extraction = await db
        .select()
        .from(aiExtractions)
        .where(eq(aiExtractions.extraction_id, contractData.source_extraction_id!))
        .limit(1);

      if (!extraction || extraction.length === 0) {
        throw new Error(`AI extraction not found for contract: ${contractId}`);
      }

      const extractionData = extraction[0];
      const verbalPromises = extractionData.contract_terms as any;

      // Get call transcript for timestamp extraction
      const callTranscript = await db
        .select()
        .from(callTranscriptions)
        .where(eq(callTranscriptions.call_id, extractionData.call_id))
        .limit(1);

      const transcriptText =
        callTranscript && callTranscript.length > 0
          ? callTranscript[0].transcription_text
          : undefined;

      logger.info('Call transcript promises retrieved', {
        extractionId: extractionData.extraction_id,
        hasTranscript: !!transcriptText,
      });

      // STEP 4: Compare terms (field-by-field)
      const discrepancyResult = await this.discrepancyService.detectDiscrepancies(
        contractTerms,
        verbalPromises,
        transcriptText
      );

      logger.info('Discrepancy detection complete', {
        discrepancies_found: discrepancyResult.discrepancies_found,
        discrepancy_count: discrepancyResult.discrepancy_count,
        highest_severity: discrepancyResult.highest_severity,
      });

      // STEP 5: Determine routing based on severity (DT-002)
      const { action_required, blocks_go_live, sla_hours } = this.determineRouting(
        discrepancyResult.highest_severity
      );

      // STEP 6: Create audit log entry
      const auditId = uuidv4();
      await db.insert(contractAuditLog).values({
        audit_id: auditId,
        contract_id: contractId,
        merchant_id: contractData.merchant_id,
        source_call_id: extractionData.call_id,
        audit_timestamp: new Date(),
        audited_by: 'AI',
        ai_model: 'manus-claude-3-5-sonnet',
        discrepancies_found: discrepancyResult.discrepancies_found,
        discrepancy_count: discrepancyResult.discrepancy_count,
        discrepancies: discrepancyResult.discrepancies,
        action_required,
        blocks_go_live,
        sla_hours,
        resolution_status: discrepancyResult.discrepancies_found ? 'Pending' : 'Resolved',
      });

      logger.info('Audit log created', { auditId });

      // STEP 7: Send notifications based on action required
      await this.sendAuditNotifications(
        auditId,
        contractData.merchant_id,
        discrepancyResult,
        action_required
      );

      return {
        audit_id: auditId,
        discrepancies_found: discrepancyResult.discrepancies_found,
        discrepancy_count: discrepancyResult.discrepancy_count,
        highest_severity: discrepancyResult.highest_severity,
        action_required,
        blocks_go_live,
      };
    } catch (error) {
      logger.error('Contract audit failed', { contractId, error });
      throw error;
    }
  }

  /**
   * Determine routing action based on highest severity (DT-002)
   * @param highestSeverity - Highest severity found
   * @returns Routing decision
   */
  private determineRouting(highestSeverity: Severity | null): {
    action_required: 'NONE' | 'SALES_OPS_REVIEW' | 'URGENT_ESCALATION';
    blocks_go_live: boolean;
    sla_hours: number;
  } {
    // No discrepancies - DT-002 lines 241-249
    if (!highestSeverity) {
      return {
        action_required: 'NONE',
        blocks_go_live: false,
        sla_hours: 0,
      };
    }

    // HIGH severity - DT-002 lines 267-279
    if (highestSeverity === 'HIGH') {
      return {
        action_required: 'URGENT_ESCALATION',
        blocks_go_live: true, // DO NOT proceed to Go-Live
        sla_hours: 24,
      };
    }

    // MEDIUM severity - DT-002 lines 281-294
    if (highestSeverity === 'MEDIUM') {
      return {
        action_required: 'SALES_OPS_REVIEW',
        blocks_go_live: false, // Allow Go-Live with warnings
        sla_hours: 48,
      };
    }

    // LOW severity - DT-002 lines 296-309
    return {
      action_required: 'SALES_OPS_REVIEW',
      blocks_go_live: false,
      sla_hours: 72,
    };
  }

  /**
   * Send audit notifications based on action required
   * @param auditId - Audit ID
   * @param merchantId - Merchant ID
   * @param discrepancyResult - Discrepancy detection result
   * @param actionRequired - Action required
   */
  private async sendAuditNotifications(
    auditId: string,
    merchantId: string,
    discrepancyResult: any,
    actionRequired: 'NONE' | 'SALES_OPS_REVIEW' | 'URGENT_ESCALATION'
  ): Promise<void> {
    try {
      if (actionRequired === 'NONE') {
        // Send success notification
        await this.notificationService.sendSlackNotification(
          '#sales-ops',
          `✅ Contract Audit Passed - Merchant ${merchantId}\n\nNo discrepancies found between contract and verbal promises.`
        );
        return;
      }

      if (actionRequired === 'URGENT_ESCALATION') {
        // HIGH severity - immediate notification
        await this.notificationService.sendSlackNotification(
          '#sales-ops',
          `🚨 URGENT: High-Severity Contract Discrepancy - Merchant ${merchantId}\n\n` +
            `Audit ID: ${auditId}\n` +
            `Discrepancies Found: ${discrepancyResult.discrepancy_count}\n` +
            `Highest Severity: ${discrepancyResult.highest_severity}\n` +
            `Action: BLOCKS GO-LIVE until resolved\n` +
            `SLA: 24 hours\n\n` +
            `View details: [Link to audit dashboard]`
        );

        // Send email to Sales Ops + Account Manager
        // await this.notificationService.sendEmail(...);
      }

      if (actionRequired === 'SALES_OPS_REVIEW') {
        // MEDIUM/LOW severity - standard notification
        const severity = discrepancyResult.highest_severity;
        await this.notificationService.sendSlackNotification(
          '#sales-ops',
          `⚠️ Contract Discrepancy Detected - Merchant ${merchantId}\n\n` +
            `Audit ID: ${auditId}\n` +
            `Severity: ${severity}\n` +
            `Discrepancies Found: ${discrepancyResult.discrepancy_count}\n` +
            `Action: ${severity === 'MEDIUM' ? 'Review required (Go-Live allowed)' : 'Low-priority review'}\n` +
            `SLA: ${severity === 'MEDIUM' ? '48' : '72'} hours\n\n` +
            `View details: [Link to audit dashboard]`
        );
      }
    } catch (error) {
      logger.error('Failed to send audit notifications', { auditId, error });
      // Don't throw - notifications are non-blocking
    }
  }

  /**
   * Get audit by ID
   * @param auditId - Audit ID
   * @returns Audit log entry
   */
  async getAudit(auditId: string) {
    const audit = await db
      .select()
      .from(contractAuditLog)
      .where(eq(contractAuditLog.audit_id, auditId))
      .limit(1);

    if (!audit || audit.length === 0) {
      throw new Error(`Audit not found: ${auditId}`);
    }

    return audit[0];
  }

  /**
   * List audits with optional filters
   * @param filters - Optional filters
   * @returns List of audits
   */
  async listAudits(filters?: {
    merchantId?: string;
    resolutionStatus?: 'Pending' | 'In Progress' | 'Resolved' | 'Accepted Risk';
    discrepanciesFound?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = db.select().from(contractAuditLog);

    // Apply filters
    if (filters?.merchantId) {
      query = query.where(eq(contractAuditLog.merchant_id, filters.merchantId)) as any;
    }

    if (filters?.resolutionStatus) {
      query = query.where(
        eq(contractAuditLog.resolution_status, filters.resolutionStatus)
      ) as any;
    }

    if (filters?.discrepanciesFound !== undefined) {
      query = query.where(
        eq(contractAuditLog.discrepancies_found, filters.discrepanciesFound)
      ) as any;
    }

    // Apply pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const audits = await query.limit(limit).offset(offset);

    return audits;
  }

  /**
   * Update audit resolution
   * @param auditId - Audit ID
   * @param resolution - Resolution details
   */
  async updateResolution(
    auditId: string,
    resolution: {
      resolved_by: string;
      resolution_notes: string;
      resolution_status: 'In Progress' | 'Resolved' | 'Accepted Risk';
    }
  ) {
    await db
      .update(contractAuditLog)
      .set({
        ...resolution,
        resolved_at: new Date(),
      })
      .where(eq(contractAuditLog.audit_id, auditId));

    logger.info('Audit resolution updated', { auditId, resolution });
  }
}
