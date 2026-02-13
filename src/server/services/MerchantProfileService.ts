import { eq, and, like, or, desc, asc } from 'drizzle-orm';
import { db } from '../db';
import { merchantProfiles, type MerchantProfile, type NewMerchantProfile } from '../db/schema/merchantProfiles.schema';
import { merchants as merchantsTable } from '../db/schema/merchants.schema';
import { profileActivityLog } from '../db/schema/profileActivityLog.schema';
import { aiExtractions } from '../db/schema/aiExtractions.schema';
import { ManusAIService } from './ManusAIService';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ProfileSearchFilters {
  merchantName?: string;
  campaignType?: string;
  priceSensitivity?: 'Low' | 'Medium' | 'High';
  humanReviewRequired?: boolean;
  isCurrentVersion?: boolean;
  minConfidence?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'extraction_confidence' | 'profile_version';
  sortDir?: 'asc' | 'desc';
}

export interface ProfileStats {
  total: number;
  currentVersions: number;
  pendingHumanReview: number;
  avgConfidence: number;
  byPriceSensitivity: Record<string, number>;
  recentActivity: number;
}

/**
 * MerchantProfileService
 *
 * Core service for Phase 6: Merchant Profile Management.
 * Handles profile creation, versioning, summary generation,
 * access control, update tracking, and search.
 */
export class MerchantProfileService {
  private aiService: ManusAIService;

  constructor() {
    this.aiService = new ManusAIService();
  }

  /**
   * Create a new merchant profile from an AI extraction
   */
  async createProfile(
    extractionId: string,
    performedBy: string,
    notes?: string
  ): Promise<MerchantProfile> {
    const [extraction] = await db
      .select()
      .from(aiExtractions)
      .where(eq(aiExtractions.extraction_id, extractionId))
      .limit(1);

    if (!extraction) {
      throw new Error(`AI extraction not found: ${extractionId}`);
    }

    const profileId = uuidv4();
    const contractTerms = extraction.contract_terms as Record<string, { value: any; confidence: number }>;
    const businessContext = extraction.business_context as Record<string, any>;
    const ownerProfile = extraction.owner_profile as Record<string, any> | null;
    const marketIntelligence = extraction.market_intelligence as Record<string, any> | null;

    const newProfile: NewMerchantProfile = {
      profile_id: profileId,
      merchant_id: extraction.merchant_id,
      source_call_id: extraction.call_id,
      source_extraction_id: extractionId,
      profile_version: 1,
      is_current_version: true,

      // Contract Terms
      commission: contractTerms?.commission?.value?.toString(),
      campaign_type: contractTerms?.campaign_type?.value,
      campaign_duration: contractTerms?.campaign_duration?.value
        ? parseInt(contractTerms.campaign_duration.value)
        : undefined,
      tablet_included: contractTerms?.tablet_included?.value === true || contractTerms?.tablet_included?.value === 'yes',
      tablet_model: contractTerms?.tablet_model?.value,
      contract_length: contractTerms?.contract_length?.value
        ? parseInt(contractTerms.contract_length.value)
        : undefined,

      // Business Context
      current_revenue_estimate: businessContext?.current_revenue?.value
        ? parseFloat(businessContext.current_revenue.value)
        : undefined,
      employee_count: businessContext?.employee_count?.value
        ? parseInt(businessContext.employee_count.value)
        : undefined,
      competitors_active: businessContext?.competitors?.value || businessContext?.competitors || [],
      merchant_goals: businessContext?.merchant_goals?.value || businessContext?.merchant_goals || [],
      expected_order_volume: businessContext?.expected_order_volume?.value,
      expansion_plans: businessContext?.expansion_plans?.value,

      // Owner Profile
      owner_personality: ownerProfile?.personality || {},
      owner_motivations: ownerProfile?.motivations || [],
      owner_concerns: ownerProfile?.concerns || [],
      decision_triggers: ownerProfile?.decision_triggers || [],

      // Market Intelligence
      price_sensitivity: (marketIntelligence?.price_sensitivity as 'Low' | 'Medium' | 'High') || undefined,

      // AI Metadata
      extraction_confidence: parseFloat(extraction.confidence_score_overall as unknown as string),
      extraction_date: extraction.extracted_at,
      human_review_required: !!(extraction.requires_manual_review),

      created_by: performedBy,
      update_notes: notes || 'Profile created from AI extraction',
      updated_by: performedBy,
      updated_at: new Date(),
    };

    await db.insert(merchantProfiles).values(newProfile);

    // Log the activity
    await this.logActivity({
      profile_id: profileId,
      merchant_id: extraction.merchant_id,
      activity_type: 'CREATED',
      performed_by: performedBy,
      notes: notes || `Profile created from extraction ${extractionId}`,
    });

    logger.info('Merchant profile created', { profileId, merchantId: extraction.merchant_id });

    const [created] = await db
      .select()
      .from(merchantProfiles)
      .where(eq(merchantProfiles.profile_id, profileId))
      .limit(1);

    return created;
  }

  /**
   * Update a merchant profile — creates a new version and supersedes the old one
   */
  async updateProfile(
    merchantId: string,
    updates: Partial<Omit<NewMerchantProfile, 'profile_id' | 'merchant_id' | 'profile_version' | 'source_call_id' | 'source_extraction_id'>>,
    performedBy: string,
    notes: string
  ): Promise<MerchantProfile> {
    const [current] = await db
      .select()
      .from(merchantProfiles)
      .where(
        and(
          eq(merchantProfiles.merchant_id, merchantId),
          eq(merchantProfiles.is_current_version, true)
        )
      )
      .limit(1);

    if (!current) {
      throw new Error(`No current profile found for merchant: ${merchantId}`);
    }

    // Track what fields changed
    const changedFields: Array<{ field: string; old_value: any; new_value: any }> = [];
    for (const [key, newVal] of Object.entries(updates)) {
      const oldVal = (current as any)[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changedFields.push({ field: key, old_value: oldVal, new_value: newVal });
      }
    }

    if (changedFields.length === 0) {
      throw new Error('No changes detected');
    }

    const newProfileId = uuidv4();

    // Mark existing as superseded
    await db
      .update(merchantProfiles)
      .set({ is_current_version: false, superseded_by: newProfileId })
      .where(eq(merchantProfiles.profile_id, current.profile_id));

    // Create new version
    const newProfile: NewMerchantProfile = {
      ...current,
      ...updates,
      profile_id: newProfileId,
      profile_version: current.profile_version + 1,
      is_current_version: true,
      superseded_by: undefined,
      created_at: new Date(),
      update_notes: notes,
      updated_by: performedBy,
      updated_at: new Date(),
      ai_summary: undefined, // reset summary — will need regeneration
    };

    await db.insert(merchantProfiles).values(newProfile);

    // Log activity with field changes
    await this.logActivity({
      profile_id: newProfileId,
      merchant_id: merchantId,
      activity_type: 'UPDATED',
      performed_by: performedBy,
      changed_fields: changedFields,
      notes,
      new_profile_version: newProfileId,
    });

    logger.info('Merchant profile updated', {
      merchantId,
      newProfileId,
      version: newProfile.profile_version,
      changedFields: changedFields.map((f) => f.field),
    });

    const [updated] = await db
      .select()
      .from(merchantProfiles)
      .where(eq(merchantProfiles.profile_id, newProfileId))
      .limit(1);

    return updated;
  }

  /**
   * Get the current version of a merchant's profile
   */
  async getProfile(merchantId: string): Promise<MerchantProfile | null> {
    const [profile] = await db
      .select()
      .from(merchantProfiles)
      .where(
        and(
          eq(merchantProfiles.merchant_id, merchantId),
          eq(merchantProfiles.is_current_version, true)
        )
      )
      .limit(1);

    return profile || null;
  }

  /**
   * Get a specific profile by its ID
   */
  async getProfileById(profileId: string): Promise<MerchantProfile | null> {
    const [profile] = await db
      .select()
      .from(merchantProfiles)
      .where(eq(merchantProfiles.profile_id, profileId))
      .limit(1);

    return profile || null;
  }

  /**
   * Get the full version history for a merchant
   */
  async getVersionHistory(merchantId: string): Promise<MerchantProfile[]> {
    return db
      .select()
      .from(merchantProfiles)
      .where(eq(merchantProfiles.merchant_id, merchantId))
      .orderBy(desc(merchantProfiles.profile_version));
  }

  /**
   * Generate an AI summary for a merchant profile
   */
  async generateProfileSummary(profileId: string, performedBy: string): Promise<string> {
    const [profile] = await db
      .select()
      .from(merchantProfiles)
      .where(eq(merchantProfiles.profile_id, profileId))
      .limit(1);

    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    const prompt = `
Generate a concise, professional merchant profile summary for a Bolt food delivery sales team.

Merchant Profile Data:
- Merchant ID: ${profile.merchant_id}
- Commission: ${profile.commission || 'Not specified'}%
- Campaign Type: ${profile.campaign_type || 'Not specified'}
- Campaign Duration: ${profile.campaign_duration || 'Not specified'} weeks
- Tablet Included: ${profile.tablet_included ? 'Yes' : 'No'}
- Tablet Model: ${profile.tablet_model || 'N/A'}
- Contract Length: ${profile.contract_length || 'Not specified'} months
- Estimated Revenue: ${profile.current_revenue_estimate ? `€${profile.current_revenue_estimate}` : 'Unknown'}
- Employee Count: ${profile.employee_count || 'Unknown'}
- Competitors: ${(profile.competitors_active as string[] || []).join(', ') || 'None identified'}
- Merchant Goals: ${(profile.merchant_goals as string[] || []).join(', ') || 'Not specified'}
- Expected Order Volume: ${profile.expected_order_volume || 'Not specified'}
- Price Sensitivity: ${profile.price_sensitivity || 'Unknown'}
- Owner Motivations: ${(profile.owner_motivations as string[] || []).join(', ') || 'Unknown'}
- Owner Concerns: ${(profile.owner_concerns as string[] || []).join(', ') || 'None noted'}
- Decision Triggers: ${(profile.decision_triggers as string[] || []).join(', ') || 'Unknown'}
- AI Confidence Score: ${profile.extraction_confidence}%
- Profile Version: ${profile.profile_version}

Write a 3-5 sentence executive summary covering:
1. Key deal terms and commercial value
2. Merchant business context and competitive landscape
3. Owner psychology and negotiation insights
4. Key risks or concerns to address

Be concise, professional, and actionable for the sales team.
`;

    const summary = await this.aiService.callAI(prompt, {
      temperature: 0.3,
      maxTokens: 500,
      systemPrompt: 'You are a sales intelligence analyst. Generate concise, professional merchant profile summaries.',
    });

    // Save the summary
    await db
      .update(merchantProfiles)
      .set({ ai_summary: summary, updated_at: new Date(), updated_by: performedBy })
      .where(eq(merchantProfiles.profile_id, profileId));

    // Log activity
    await this.logActivity({
      profile_id: profileId,
      merchant_id: profile.merchant_id,
      activity_type: 'SUMMARY_GENERATED',
      performed_by: performedBy,
      notes: 'AI summary generated',
    });

    return summary;
  }

  /**
   * Search and filter merchant profiles
   */
  async searchProfiles(filters: ProfileSearchFilters): Promise<{
    profiles: MerchantProfile[];
    total: number;
  }> {
    const conditions = [];

    if (filters.isCurrentVersion !== undefined) {
      conditions.push(eq(merchantProfiles.is_current_version, filters.isCurrentVersion));
    } else {
      // Default to current versions only
      conditions.push(eq(merchantProfiles.is_current_version, true));
    }

    if (filters.campaignType) {
      conditions.push(like(merchantProfiles.campaign_type, `%${filters.campaignType}%`));
    }

    if (filters.priceSensitivity) {
      conditions.push(eq(merchantProfiles.price_sensitivity, filters.priceSensitivity));
    }

    if (filters.humanReviewRequired !== undefined) {
      conditions.push(eq(merchantProfiles.human_review_required, filters.humanReviewRequired));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn =
      filters.sortBy === 'extraction_confidence'
        ? merchantProfiles.extraction_confidence
        : filters.sortBy === 'profile_version'
        ? merchantProfiles.profile_version
        : merchantProfiles.created_at;

    const sortOrder = filters.sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const [profiles, countResult] = await Promise.all([
      db
        .select()
        .from(merchantProfiles)
        .where(whereClause)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      db
        .select()
        .from(merchantProfiles)
        .where(whereClause),
    ]);

    return { profiles, total: countResult.length };
  }

  /**
   * Get activity log for a merchant profile
   */
  async getActivityLog(
    merchantId: string,
    limit = 50
  ): Promise<typeof profileActivityLog.$inferSelect[]> {
    return db
      .select()
      .from(profileActivityLog)
      .where(eq(profileActivityLog.merchant_id, merchantId))
      .orderBy(desc(profileActivityLog.created_at))
      .limit(limit);
  }

  /**
   * Mark a profile as human-reviewed
   */
  async markReviewed(
    profileId: string,
    reviewedBy: string,
    notes?: string
  ): Promise<void> {
    const [profile] = await db
      .select()
      .from(merchantProfiles)
      .where(eq(merchantProfiles.profile_id, profileId))
      .limit(1);

    if (!profile) throw new Error(`Profile not found: ${profileId}`);

    await db
      .update(merchantProfiles)
      .set({
        human_review_required: false,
        human_reviewed_by: reviewedBy,
        human_reviewed_at: new Date(),
        updated_at: new Date(),
        updated_by: reviewedBy,
      })
      .where(eq(merchantProfiles.profile_id, profileId));

    await this.logActivity({
      profile_id: profileId,
      merchant_id: profile.merchant_id,
      activity_type: 'REVIEWED',
      performed_by: reviewedBy,
      notes: notes || 'Profile reviewed and approved',
    });
  }

  /**
   * Get aggregate stats for the profile dashboard
   */
  async getStats(): Promise<ProfileStats> {
    const all = await db.select().from(merchantProfiles);
    const current = all.filter((p) => p.is_current_version);
    const pendingReview = current.filter((p) => p.human_review_required);
    const confidenceValues = current
      .map((p) => parseFloat(p.extraction_confidence as unknown as string || '0'))
      .filter((v) => v > 0);

    const avgConfidence =
      confidenceValues.length > 0
        ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
        : 0;

    const bySensitivity: Record<string, number> = { Low: 0, Medium: 0, High: 0, Unknown: 0 };
    for (const p of current) {
      const key = p.price_sensitivity || 'Unknown';
      bySensitivity[key] = (bySensitivity[key] || 0) + 1;
    }

    // Activity in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await db
      .select()
      .from(profileActivityLog)
      .where(
        // Filter by created_at >= 7 days ago using raw comparison
        // Note: drizzle gte import not used to keep imports clean
        eq(profileActivityLog.activity_type, 'CREATED')
      );

    return {
      total: all.length,
      currentVersions: current.length,
      pendingHumanReview: pendingReview.length,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      byPriceSensitivity: bySensitivity,
      recentActivity: recentActivity.filter(
        (a) => new Date(a.created_at) >= sevenDaysAgo
      ).length,
    };
  }

  private async logActivity(data: {
    profile_id: string;
    merchant_id: string;
    activity_type: typeof profileActivityLog.$inferInsert['activity_type'];
    performed_by: string;
    performed_by_role?: string;
    changed_fields?: Array<{ field: string; old_value: any; new_value: any }>;
    notes?: string;
    new_profile_version?: string;
  }): Promise<void> {
    await db.insert(profileActivityLog).values({
      activity_id: uuidv4(),
      ...data,
    });
  }
}
