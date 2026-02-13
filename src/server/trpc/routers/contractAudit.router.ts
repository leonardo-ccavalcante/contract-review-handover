import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { ContractAuditService } from '../../services/ContractAuditService';

const contractAuditService = new ContractAuditService();

export const contractAuditRouter = router({
  /**
   * Execute contract audit (DT-002)
   * Compares signed contract with call promises
   */
  executeAudit: protectedProcedure
    .input(
      z.object({
        contractId: z.string(),
        pdfBase64: z.string().optional(), // Optional base64-encoded PDF
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Convert base64 to buffer if provided
        const pdfBuffer = input.pdfBase64
          ? Buffer.from(input.pdfBase64, 'base64')
          : undefined;

        const result = await contractAuditService.executeContractAudit(
          input.contractId,
          pdfBuffer
        );

        return {
          success: true,
          audit: result,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Contract audit failed: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Get audit by ID
   */
  getAudit: protectedProcedure
    .input(
      z.object({
        auditId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const audit = await contractAuditService.getAudit(input.auditId);
        return audit;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Audit not found: ${input.auditId}`,
        });
      }
    }),

  /**
   * List audits with optional filters
   */
  listAudits: protectedProcedure
    .input(
      z.object({
        merchantId: z.string().optional(),
        resolutionStatus: z
          .enum(['Pending', 'In Progress', 'Resolved', 'Accepted Risk'])
          .optional(),
        discrepanciesFound: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const audits = await contractAuditService.listAudits(input);
      return audits;
    }),

  /**
   * Update audit resolution
   * Sales Ops marks discrepancies as resolved
   */
  updateResolution: protectedProcedure
    .input(
      z.object({
        auditId: z.string(),
        resolutionNotes: z.string().min(20),
        resolutionStatus: z.enum(['In Progress', 'Resolved', 'Accepted Risk']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await contractAuditService.updateResolution(input.auditId, {
          resolved_by: ctx.user.id,
          resolution_notes: input.resolutionNotes,
          resolution_status: input.resolutionStatus,
        });

        return {
          success: true,
          message: 'Audit resolution updated successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update resolution: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Get audit statistics
   * Dashboard metrics
   */
  getAuditStats: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ input }) => {
      const audits = await contractAuditService.listAudits({
        limit: 1000,
      });

      // Calculate start date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      // Filter audits within date range
      const recentAudits = audits.filter(
        (audit) => new Date(audit.audit_timestamp) >= startDate
      );

      // Calculate statistics
      const totalAudits = recentAudits.length;
      const withDiscrepancies = recentAudits.filter(
        (a) => a.discrepancies_found
      ).length;
      const passRate =
        totalAudits > 0
          ? ((totalAudits - withDiscrepancies) / totalAudits) * 100
          : 100;

      // By severity
      const byHighSeverity = recentAudits.filter((a) =>
        a.discrepancies?.some((d: any) => d.severity === 'HIGH')
      ).length;
      const byMediumSeverity = recentAudits.filter(
        (a) =>
          a.discrepancies?.some((d: any) => d.severity === 'MEDIUM') &&
          !a.discrepancies?.some((d: any) => d.severity === 'HIGH')
      ).length;
      const byLowSeverity = recentAudits.filter(
        (a) =>
          a.discrepancies?.some((d: any) => d.severity === 'LOW') &&
          !a.discrepancies?.some((d: any) => d.severity === 'MEDIUM') &&
          !a.discrepancies?.some((d: any) => d.severity === 'HIGH')
      ).length;

      // By resolution status
      const pending = recentAudits.filter(
        (a) => a.resolution_status === 'Pending'
      ).length;
      const inProgress = recentAudits.filter(
        (a) => a.resolution_status === 'In Progress'
      ).length;
      const resolved = recentAudits.filter(
        (a) => a.resolution_status === 'Resolved'
      ).length;

      return {
        period_days: input.days,
        start_date: startDate.toISOString(),
        total_audits: totalAudits,
        pass_rate: Math.round(passRate * 100) / 100,
        with_discrepancies: withDiscrepancies,
        by_severity: {
          high: byHighSeverity,
          medium: byMediumSeverity,
          low: byLowSeverity,
        },
        by_resolution_status: {
          pending,
          in_progress: inProgress,
          resolved,
        },
      };
    }),

  /**
   * Get most common discrepancy fields
   * Analytics for improvement areas
   */
  getMostCommonDiscrepancies: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const audits = await contractAuditService.listAudits({
        discrepanciesFound: true,
        limit: 500,
      });

      // Calculate start date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      // Filter recent audits
      const recentAudits = audits.filter(
        (audit) => new Date(audit.audit_timestamp) >= startDate
      );

      // Count discrepancies by field
      const fieldCounts: Record<string, number> = {};

      for (const audit of recentAudits) {
        if (audit.discrepancies && Array.isArray(audit.discrepancies)) {
          for (const discrepancy of audit.discrepancies as any[]) {
            const field = discrepancy.field;
            fieldCounts[field] = (fieldCounts[field] || 0) + 1;
          }
        }
      }

      // Sort by count and limit
      const sortedFields = Object.entries(fieldCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, input.limit)
        .map(([field, count]) => ({ field, count }));

      return {
        period_days: input.days,
        most_common_discrepancies: sortedFields,
      };
    }),
});
