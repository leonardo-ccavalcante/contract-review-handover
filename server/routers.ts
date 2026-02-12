import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { 
  createCallTranscription,
  getAllCallTranscriptions,
  getCallTranscriptionByCallId,
  updateCallTranscriptionStatus,
  createContract,
  getAllContracts,
  getContractByContractId,
  updateContractStatus,
  updateContractExtractedTerms,
  getAllMerchantProfiles,
  getMerchantProfileByProfileId,
  getMerchantProfilesByAccountManager,
  createMerchantProfile,
  updateMerchantProfile,
  createAiExtraction,
  getAiExtractionByCallId,
  createValidation,
  getValidationByExtractionId,
  updateValidation,
  getPendingValidations,
  createContractAudit,
  getContractAuditByContractId,
  getAllContractAudits,
  getUnresolvedAudits,
  updateContractAuditResolution,
  createExceptionLog,
  getAllExceptionLogs,
  getOpenExceptionLogs,
  resolveExceptionLog,
  createNotification,
  getNotificationsByUserId,
  getUnreadNotificationsByUserId,
  markNotificationAsRead,
  getAllValidationRules,
  getActiveValidationRules,
  createValidationRule,
  updateValidationRule,
  toggleValidationRuleStatus,
} from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ CALL TRANSCRIPTION ROUTES ============
  transcriptions: router({
    // Upload text transcription
    uploadText: protectedProcedure
      .input(z.object({
        transcriptionText: z.string(),
        merchantName: z.string().optional(),
        salesManagerId: z.string().optional(),
        callDate: z.string().optional(),
        callDurationMinutes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const callId = nanoid();
        
        const transcription = await createCallTranscription({
          callId,
          uploadedBy: ctx.user.id,
          transcriptionText: input.transcriptionText,
          merchantName: input.merchantName,
          salesManagerId: input.salesManagerId,
          callDate: input.callDate ? new Date(input.callDate) : undefined,
          callDurationMinutes: input.callDurationMinutes,
          fileFormat: "txt",
          status: "uploaded",
        });

        return transcription;
      }),

    // Upload audio file for transcription
    uploadAudio: protectedProcedure
      .input(z.object({
        audioBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
        merchantName: z.string().optional(),
        salesManagerId: z.string().optional(),
        callDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const callId = nanoid();
        
        // Upload audio to S3
        const audioBuffer = Buffer.from(input.audioBase64, 'base64');
        const audioKey = `calls/${callId}/${input.fileName}`;
        const { url: audioUrl } = await storagePut(audioKey, audioBuffer, input.mimeType);

        // Create initial transcription record
        const transcription = await createCallTranscription({
          callId,
          uploadedBy: ctx.user.id,
          transcriptionText: "", // Will be filled after transcription
          merchantName: input.merchantName,
          salesManagerId: input.salesManagerId,
          callDate: input.callDate ? new Date(input.callDate) : undefined,
          fileFormat: input.mimeType.split('/')[1] || 'audio',
          audioFileUrl: audioUrl,
          audioFileKey: audioKey,
          status: "processing",
        });

        // Transcribe audio asynchronously
        try {
          const transcriptionResult = await transcribeAudio({
            audioUrl: audioUrl,
            language: "en",
          });

          // Check if transcription was successful
          if ('text' in transcriptionResult) {
            // Update with transcription text
            await updateCallTranscriptionStatus(callId, "uploaded");
            
            // Update transcription text in database
            const { getDb } = await import("./db");
            const { callTranscriptions } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            const db = await getDb();
            if (db) {
              await db.update(callTranscriptions)
                .set({ 
                  transcriptionText: transcriptionResult.text,
                })
                .where(eq(callTranscriptions.callId, callId));
            }
          } else {
            throw new Error("Transcription failed");
          }
        } catch (error) {
          await updateCallTranscriptionStatus(callId, "failed");
          console.error("Transcription failed:", error);
        }

        return transcription;
      }),

    // Get all transcriptions
    list: protectedProcedure.query(async () => {
      return await getAllCallTranscriptions();
    }),

    // Get single transcription
    getById: protectedProcedure
      .input(z.object({ callId: z.string() }))
      .query(async ({ input }) => {
        return await getCallTranscriptionByCallId(input.callId);
      }),

    // Trigger AI extraction
    triggerExtraction: protectedProcedure
      .input(z.object({ callId: z.string() }))
      .mutation(async ({ input }) => {
        const transcription = await getCallTranscriptionByCallId(input.callId);
        if (!transcription) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Transcription not found" });
        }

        await updateCallTranscriptionStatus(input.callId, "processing");

        // Perform AI extraction
        const extractionId = nanoid();
        const startTime = Date.now();

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an AI assistant that extracts structured data from sales call transcriptions. Extract the following information and provide confidence scores (0-100) for each field: Contract terms (commission, campaign type, campaign duration, tablet included, contract length), Business context (current revenue, competitors, goals), Owner profile (personality traits, main concerns, decision triggers), Market intelligence (cuisine type, price sensitivity, expansion potential). Return your response as valid JSON matching this schema."
              },
              {
                role: "user",
                content: "Extract structured data from this sales call transcription:\n\n" + transcription.transcriptionText
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "extraction_result",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    contractTerms: {
                      type: "object",
                      properties: {
                        commission: { type: "string" },
                        commissionConfidence: { type: "number" },
                        campaignType: { type: "string" },
                        campaignConfidence: { type: "number" },
                        tabletIncluded: { type: "boolean" },
                        tabletConfidence: { type: "number" },
                        contractLength: { type: "string" },
                        contractLengthConfidence: { type: "number" },
                      },
                      required: ["commission", "commissionConfidence", "campaignType", "campaignConfidence", "tabletIncluded", "tabletConfidence", "contractLength", "contractLengthConfidence"],
                      additionalProperties: false
                    },
                    businessContext: {
                      type: "object",
                      properties: {
                        currentRevenue: { type: "string" },
                        revenueConfidence: { type: "number" },
                        competitors: { type: "array", items: { type: "string" } },
                        competitorsConfidence: { type: "number" },
                        goals: { type: "array", items: { type: "string" } },
                        goalsConfidence: { type: "number" },
                      },
                      required: ["currentRevenue", "revenueConfidence", "competitors", "competitorsConfidence", "goals", "goalsConfidence"],
                      additionalProperties: false
                    },
                    ownerProfile: {
                      type: "object",
                      properties: {
                        personalityTraits: { type: "array", items: { type: "string" } },
                        personalityConfidence: { type: "number" },
                        mainConcerns: { type: "array", items: { type: "string" } },
                        concernsConfidence: { type: "number" },
                        decisionTriggers: { type: "array", items: { type: "string" } },
                        triggersConfidence: { type: "number" },
                      },
                      required: ["personalityTraits", "personalityConfidence", "mainConcerns", "concernsConfidence", "decisionTriggers", "triggersConfidence"],
                      additionalProperties: false
                    },
                    marketIntelligence: {
                      type: "object",
                      properties: {
                        cuisineType: { type: "string" },
                        cuisineConfidence: { type: "number" },
                        priceSensitivity: { type: "string" },
                        priceSensitivityConfidence: { type: "number" },
                        expansionPotential: { type: "string" },
                        expansionConfidence: { type: "number" },
                      },
                      required: ["cuisineType", "cuisineConfidence", "priceSensitivity", "priceSensitivityConfidence", "expansionPotential", "expansionConfidence"],
                      additionalProperties: false
                    },
                    overallConfidence: { type: "number" },
                  },
                  required: ["contractTerms", "businessContext", "ownerProfile", "marketIntelligence", "overallConfidence"],
                  additionalProperties: false
                }
              }
            }
          });

          const messageContent = response.choices[0].message.content;
          if (typeof messageContent !== 'string') {
            throw new Error("Invalid response format from LLM");
          }
          const extractedData = JSON.parse(messageContent);
          const processingTime = Math.floor((Date.now() - startTime) / 1000);

          // Determine low confidence fields
          const lowConfidenceFields: string[] = [];
          const checkConfidence = (obj: any, prefix: string = "") => {
            for (const key in obj) {
              if (key.endsWith("Confidence") && typeof obj[key] === "number" && obj[key] < 90) {
                const fieldName = prefix + key.replace("Confidence", "");
                lowConfidenceFields.push(fieldName);
              } else if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
                checkConfidence(obj[key], prefix + key + ".");
              }
            }
          };
          checkConfidence(extractedData);

          // Save extraction result
          const extraction = await createAiExtraction({
            extractionId,
            callId: input.callId,
            confidenceScoreOverall: extractedData.overallConfidence,
            extractedData,
            flags: {
              requiresManualReview: extractedData.overallConfidence < 90,
              lowConfidenceFields,
            },
            processingTimeSeconds: processingTime,
            modelUsed: "gpt-4",
          });

          await updateCallTranscriptionStatus(input.callId, "extracted");

          return extraction;
        } catch (error) {
          await updateCallTranscriptionStatus(input.callId, "failed");
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: "AI extraction failed",
            cause: error 
          });
        }
      }),
  }),

  // ============ CONTRACT ROUTES ============
  contracts: router({
    // Upload contract PDF
    upload: protectedProcedure
      .input(z.object({
        pdfBase64: z.string(),
        fileName: z.string(),
        merchantId: z.string(),
        sourceCallId: z.string().optional(),
        contractSignedAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const contractId = nanoid();
        
        // Upload PDF to S3
        const pdfBuffer = Buffer.from(input.pdfBase64, 'base64');
        const pdfKey = `contracts/${contractId}/${input.fileName}`;
        const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, "application/pdf");

        const contract = await createContract({
          contractId,
          merchantId: input.merchantId,
          sourceCallId: input.sourceCallId,
          contractPdfUrl: pdfUrl,
          contractPdfKey: pdfKey,
          contractSignedAt: input.contractSignedAt ? new Date(input.contractSignedAt) : undefined,
          uploadedBy: ctx.user.id,
          contractStatus: "uploaded",
        });

        return contract;
      }),

    // Get all contracts
    list: protectedProcedure.query(async () => {
      return await getAllContracts();
    }),

    // Get single contract
    getById: protectedProcedure
      .input(z.object({ contractId: z.string() }))
      .query(async ({ input }) => {
        return await getContractByContractId(input.contractId);
      }),
  }),

  // ============ MERCHANT PROFILE ROUTES ============
  merchants: router({
    // Get all merchant profiles
    list: protectedProcedure.query(async () => {
      return await getAllMerchantProfiles();
    }),

    // Get merchant profile by ID
    getById: protectedProcedure
      .input(z.object({ profileId: z.string() }))
      .query(async ({ input }) => {
        return await getMerchantProfileByProfileId(input.profileId);
      }),

    // Get profiles assigned to current user (if Account Manager)
    myMerchants: protectedProcedure.query(async ({ ctx }) => {
      return await getMerchantProfilesByAccountManager(ctx.user.id);
    }),
  }),

  // ============ VALIDATION ROUTES ============
  validations: router({
    // Get pending validations
    pending: protectedProcedure.query(async () => {
      return await getPendingValidations();
    }),
  }),

  // ============ AUDIT ROUTES ============
  audits: router({
    // Get all audits
    list: protectedProcedure.query(async () => {
      return await getAllContractAudits();
    }),

    // Get unresolved audits
    unresolved: protectedProcedure.query(async () => {
      return await getUnresolvedAudits();
    }),
  }),

  // ============ NOTIFICATION ROUTES ============
  notifications: router({
    // Get user notifications
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getNotificationsByUserId(ctx.user.id);
    }),

    // Get unread notifications
    unread: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadNotificationsByUserId(ctx.user.id);
    }),

    // Mark notification as read
    markRead: protectedProcedure
      .input(z.object({ notificationId: z.string() }))
      .mutation(async ({ input }) => {
        await markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
  }),

  // ============ ADMIN ROUTES ============
  admin: router({
    // Get all validation rules
    validationRules: protectedProcedure.query(async () => {
      return await getAllValidationRules();
    }),

    // Get exception logs
    exceptionLogs: protectedProcedure.query(async () => {
      return await getAllExceptionLogs();
    }),

    // Get open exceptions
    openExceptions: protectedProcedure.query(async () => {
      return await getOpenExceptionLogs();
    }),
  }),
});

export type AppRouter = typeof appRouter;
