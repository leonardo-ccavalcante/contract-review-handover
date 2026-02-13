import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, salesManagerProcedure } from '../trpc';
import { MerchantProfileService } from '../../services/MerchantProfileService';

const profileService = new MerchantProfileService();

/**
 * Merchant Profile Router - Phase 6
 *
 * Endpoints for profile creation, versioning, summary generation,
 * access control, update tracking, and search/filtering.
 */
export const merchantProfileRouter = router({
  /**
   * Create a new merchant profile from an AI extraction
   * Requires Sales Manager or above
   */
  createProfile: salesManagerProcedure
    .input(
      z.object({
        extractionId: z.string().min(1),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const profile = await profileService.createProfile(
          input.extractionId,
          ctx.user.id,
          input.notes
        );
        return { success: true, profile };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: (error as Error).message,
        });
      }
    }),

  /**
   * Update a merchant profile — creates a new version automatically
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        merchantId: z.string().min(1),
        updates: z.object({
          commission: z.string().optional(),
          campaign_type: z.string().optional(),
          campaign_duration: z.number().int().positive().optional(),
          tablet_included: z.boolean().optional(),
          tablet_model: z.string().optional(),
          contract_length: z.number().int().positive().optional(),
          current_revenue_estimate: z.number().positive().optional(),
          employee_count: z.number().int().positive().optional(),
          competitors_active: z.array(z.string()).optional(),
          merchant_goals: z.array(z.string()).optional(),
          expected_order_volume: z.string().optional(),
          expansion_plans: z.string().optional(),
          owner_personality: z.record(z.unknown()).optional(),
          owner_motivations: z.array(z.string()).optional(),
          owner_concerns: z.array(z.string()).optional(),
          decision_triggers: z.array(z.string()).optional(),
          price_sensitivity: z.enum(['Low', 'Medium', 'High']).optional(),
          human_review_required: z.boolean().optional(),
        }),
        notes: z.string().min(10, 'Update notes must be at least 10 characters'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const profile = await profileService.updateProfile(
          input.merchantId,
          input.updates,
          ctx.user.id,
          input.notes
        );
        return { success: true, profile };
      } catch (error) {
        const err = error as Error;
        throw new TRPCError({
          code: err.message.includes('not found') ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          message: err.message,
        });
      }
    }),

  /**
   * Get the current version of a merchant profile
   */
  getProfile: protectedProcedure
    .input(z.object({ merchantId: z.string().min(1) }))
    .query(async ({ input }) => {
      const profile = await profileService.getProfile(input.merchantId);
      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No profile found for merchant: ${input.merchantId}`,
        });
      }
      return profile;
    }),

  /**
   * Get a specific profile version by profile ID
   */
  getProfileById: protectedProcedure
    .input(z.object({ profileId: z.string().min(1) }))
    .query(async ({ input }) => {
      const profile = await profileService.getProfileById(input.profileId);
      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Profile not found: ${input.profileId}`,
        });
      }
      return profile;
    }),

  /**
   * Get full version history for a merchant
   */
  getVersionHistory: protectedProcedure
    .input(z.object({ merchantId: z.string().min(1) }))
    .query(async ({ input }) => {
      const versions = await profileService.getVersionHistory(input.merchantId);
      return { versions, total: versions.length };
    }),

  /**
   * Generate an AI summary for a profile
   */
  generateSummary: protectedProcedure
    .input(z.object({ profileId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const summary = await profileService.generateProfileSummary(
          input.profileId,
          ctx.user.id
        );
        return { success: true, summary };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: (error as Error).message,
        });
      }
    }),

  /**
   * Search and filter merchant profiles
   */
  searchProfiles: protectedProcedure
    .input(
      z.object({
        campaignType: z.string().optional(),
        priceSensitivity: z.enum(['Low', 'Medium', 'High']).optional(),
        humanReviewRequired: z.boolean().optional(),
        isCurrentVersion: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        sortBy: z.enum(['created_at', 'extraction_confidence', 'profile_version']).optional(),
        sortDir: z.enum(['asc', 'desc']).optional(),
      })
    )
    .query(async ({ input }) => {
      return profileService.searchProfiles(input);
    }),

  /**
   * List all current profiles (paginated)
   */
  listProfiles: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return profileService.searchProfiles({
        isCurrentVersion: true,
        ...input,
        sortBy: 'created_at',
        sortDir: 'desc',
      });
    }),

  /**
   * Get the activity log for a merchant's profiles
   */
  getActivityLog: protectedProcedure
    .input(
      z.object({
        merchantId: z.string().min(1),
        limit: z.number().int().min(1).max(200).default(50),
      })
    )
    .query(async ({ input }) => {
      const logs = await profileService.getActivityLog(input.merchantId, input.limit);
      return { logs, total: logs.length };
    }),

  /**
   * Mark a profile as human-reviewed
   * (Clears the human_review_required flag)
   */
  markReviewed: protectedProcedure
    .input(
      z.object({
        profileId: z.string().min(1),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await profileService.markReviewed(input.profileId, ctx.user.id, input.notes);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: (error as Error).message,
        });
      }
    }),

  /**
   * Get dashboard statistics
   */
  getStats: protectedProcedure.query(async () => {
    return profileService.getStats();
  }),
});
