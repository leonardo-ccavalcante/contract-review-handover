import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db, validationLog } from '../../db';
import { sql, and, gte, count } from 'drizzle-orm';

/**
 * Reports Router
 *
 * tRPC endpoints for validation reporting and analytics
 */
export const reportsRouter = router({
  /**
   * Get daily validation report
   */
  getDailyReport: protectedProcedure
    .input(
      z.object({
        date: z.string().optional(), // ISO date string (defaults to today)
      })
    )
    .query(async ({ input }) => {
      const targetDate = input.date ? new Date(input.date) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get validation stats for the day
      const stats = await db
        .select({
          status: validationLog.validation_status,
          count: count(),
        })
        .from(validationLog)
        .where(
          and(
            gte(validationLog.validation_timestamp, targetDate),
            gte(nextDate, validationLog.validation_timestamp)
          )
        )
        .groupBy(validationLog.validation_status);

      const totalValidations = stats.reduce((sum, s) => sum + s.count, 0);
      const passed = stats.find(s => s.status === 'PASS')?.count || 0;
      const failed = stats.find(s => s.status === 'FAIL')?.count || 0;
      const manualReview = stats.find(s => s.status === 'MANUAL_REVIEW')?.count || 0;
      const overridden = stats.find(s => s.status === 'OVERRIDE')?.count || 0;

      return {
        date: targetDate.toISOString(),
        total_validations: totalValidations,
        passed,
        failed,
        manual_review: manualReview,
        overridden,
        pass_rate: totalValidations > 0 ? (passed / totalValidations) * 100 : 0,
        stats,
      };
    }),

  /**
   * Get validation statistics (aggregated)
   */
  getValidationStats: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      startDate.setHours(0, 0, 0, 0);

      // Get aggregated stats
      const results = await db
        .select({
          status: validationLog.validation_status,
          count: count(),
        })
        .from(validationLog)
        .where(gte(validationLog.validation_timestamp, startDate))
        .groupBy(validationLog.validation_status);

      const totalValidations = results.reduce((sum, r) => sum + r.count, 0);

      return {
        period_days: input.days,
        start_date: startDate.toISOString(),
        total_validations: totalValidations,
        by_status: results,
      };
    }),

  /**
   * Get most common missing fields
   */
  getMostCommonMissingFields: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      // Get validations with missing fields
      const validations = await db
        .select()
        .from(validationLog)
        .where(gte(validationLog.validation_timestamp, startDate));

      // Count missing fields
      const fieldCounts: Record<string, number> = {};

      for (const validation of validations) {
        if (validation.missing_fields && Array.isArray(validation.missing_fields)) {
          for (const field of validation.missing_fields) {
            fieldCounts[field] = (fieldCounts[field] || 0) + 1;
          }
        }
      }

      // Sort and limit
      const sortedFields = Object.entries(fieldCounts)
        .map(([field, count]) => ({ field, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, input.limit);

      return {
        period_days: input.days,
        most_common_missing_fields: sortedFields,
      };
    }),
});
