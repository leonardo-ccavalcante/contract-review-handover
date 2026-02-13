import { z } from 'zod';
import { router, protectedProcedure, salesManagerProcedure } from '../trpc';
import { ValidationService } from '../../services/ValidationService';
import { TRPCError } from '@trpc/server';

const validationService = new ValidationService();

/**
 * Validation Router
 *
 * tRPC endpoints for Hard Gate #1 validation operations
 */
export const validationRouter = router({
  /**
   * Execute Hard Gate validation (DT-001)
   */
  executeHardGate: protectedProcedure
    .input(
      z.object({
        extractionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const validation = await validationService.executeHardGate(input.extractionId);
        return {
          success: true,
          validation,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Validation failed',
        });
      }
    }),

  /**
   * Get validation by ID
   */
  getValidation: protectedProcedure
    .input(
      z.object({
        validationId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const validation = await validationService.getValidation(input.validationId);

      if (!validation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Validation not found',
        });
      }

      return validation;
    }),

  /**
   * List validations with filters
   */
  listValidations: protectedProcedure
    .input(
      z.object({
        status: z.enum(['PASS', 'FAIL', 'MANUAL_REVIEW', 'OVERRIDE']).optional(),
        merchantId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const validations = await validationService.listValidations(input);
      return validations;
    }),

  /**
   * Request override (Sales Manager only)
   */
  requestOverride: salesManagerProcedure
    .input(
      z.object({
        validationId: z.string(),
        justification: z.string().min(50, 'Justification must be at least 50 characters'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const validation = await validationService.processOverride(
          input.validationId,
          ctx.user.id,
          input.justification
        );

        return {
          success: true,
          validation,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Override request failed',
        });
      }
    }),
});
