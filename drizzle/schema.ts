import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "account_manager", "sales_ops", "sales_manager"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Call transcriptions table - stores sales call transcripts
 */
export const callTranscriptions = mysqlTable("call_transcriptions", {
  id: int("id").autoincrement().primaryKey(),
  callId: varchar("callId", { length: 64 }).notNull().unique(),
  uploadedBy: int("uploadedBy").notNull().references(() => users.id),
  uploadTimestamp: timestamp("uploadTimestamp").defaultNow().notNull(),
  transcriptionText: text("transcriptionText").notNull(),
  merchantName: varchar("merchantName", { length: 255 }),
  salesManagerId: varchar("salesManagerId", { length: 64 }),
  callDate: timestamp("callDate"),
  callDurationMinutes: int("callDurationMinutes"),
  fileFormat: varchar("fileFormat", { length: 20 }),
  fileSize: int("fileSize"),
  audioFileUrl: text("audioFileUrl"),
  audioFileKey: text("audioFileKey"),
  transcriptionFileUrl: text("transcriptionFileUrl"),
  transcriptionFileKey: text("transcriptionFileKey"),
  status: mysqlEnum("status", ["uploaded", "processing", "extracted", "failed"]).default("uploaded").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CallTranscription = typeof callTranscriptions.$inferSelect;
export type InsertCallTranscription = typeof callTranscriptions.$inferInsert;

/**
 * Merchant profiles table - stores merchant business information
 */
export const merchantProfiles = mysqlTable("merchant_profiles", {
  id: int("id").autoincrement().primaryKey(),
  profileId: varchar("profileId", { length: 64 }).notNull().unique(),
  merchantId: varchar("merchantId", { length: 64 }).notNull(),
  merchantName: varchar("merchantName", { length: 255 }).notNull(),
  profileVersion: int("profileVersion").default(1).notNull(),
  sourceCallId: varchar("sourceCallId", { length: 64 }).references(() => callTranscriptions.callId),
  segment: mysqlEnum("segment", ["SMB", "MM", "Enterprise"]).default("SMB"),
  contractTerms: json("contractTerms").$type<{
    commission?: string;
    commissionConfidence?: number;
    campaignType?: string;
    campaignConfidence?: number;
    tabletIncluded?: boolean;
    tabletConfidence?: number;
    contractLength?: string;
    contractLengthConfidence?: number;
  }>(),
  businessContext: json("businessContext").$type<{
    currentRevenue?: string;
    revenueConfidence?: number;
    competitors?: string[];
    competitorsConfidence?: number;
    goals?: string[];
    goalsConfidence?: number;
  }>(),
  ownerProfile: json("ownerProfile").$type<{
    personalityTraits?: string[];
    personalityConfidence?: number;
    mainConcerns?: string[];
    concernsConfidence?: number;
    decisionTriggers?: string[];
    triggersConfidence?: number;
  }>(),
  marketIntelligence: json("marketIntelligence").$type<{
    cuisineType?: string;
    cuisineConfidence?: number;
    priceSensitivity?: string;
    priceSensitivityConfidence?: number;
    expansionPotential?: string;
    expansionConfidence?: number;
  }>(),
  profileSummary: text("profileSummary"),
  overallConfidence: int("overallConfidence"),
  humanReviewRequired: boolean("humanReviewRequired").default(false),
  assignedAccountManager: int("assignedAccountManager").references(() => users.id),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MerchantProfile = typeof merchantProfiles.$inferSelect;
export type InsertMerchantProfile = typeof merchantProfiles.$inferInsert;

/**
 * AI extractions table - stores AI extraction results
 */
export const aiExtractions = mysqlTable("ai_extractions", {
  id: int("id").autoincrement().primaryKey(),
  extractionId: varchar("extractionId", { length: 64 }).notNull().unique(),
  callId: varchar("callId", { length: 64 }).notNull().references(() => callTranscriptions.callId),
  extractedAt: timestamp("extractedAt").defaultNow().notNull(),
  confidenceScoreOverall: int("confidenceScoreOverall"),
  extractedData: json("extractedData").$type<{
    contractTerms?: any;
    businessContext?: any;
    ownerProfile?: any;
    marketIntelligence?: any;
  }>(),
  flags: json("flags").$type<{
    requiresManualReview?: boolean;
    lowConfidenceFields?: string[];
  }>(),
  processingTimeSeconds: int("processingTimeSeconds"),
  modelUsed: varchar("modelUsed", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiExtraction = typeof aiExtractions.$inferSelect;
export type InsertAiExtraction = typeof aiExtractions.$inferInsert;

/**
 * Validations table - stores pre-contract validation results (Hard Gate)
 */
export const validations = mysqlTable("validations", {
  id: int("id").autoincrement().primaryKey(),
  validationId: varchar("validationId", { length: 64 }).notNull().unique(),
  extractionId: varchar("extractionId", { length: 64 }).notNull().references(() => aiExtractions.extractionId),
  merchantId: varchar("merchantId", { length: 64 }),
  validationStatus: mysqlEnum("validationStatus", ["PASS", "FAIL", "MANUAL_REVIEW", "VALIDATED_AUTO", "VALIDATED_MANUAL", "VALIDATED_OVERRIDE", "BLOCKED_INCOMPLETE"]).notNull(),
  validationTimestamp: timestamp("validationTimestamp").defaultNow().notNull(),
  mandatoryFieldsComplete: boolean("mandatoryFieldsComplete").default(false),
  aiConfidenceThresholdMet: boolean("aiConfidenceThresholdMet").default(false),
  missingFields: json("missingFields").$type<string[]>(),
  lowConfidenceFields: json("lowConfidenceFields").$type<string[]>(),
  nextAction: varchar("nextAction", { length: 100 }),
  blockingReasons: json("blockingReasons").$type<string[]>(),
  canProceedToContract: boolean("canProceedToContract").default(false),
  overrideAvailable: boolean("overrideAvailable").default(true),
  overrideBy: int("overrideBy").references(() => users.id),
  overrideJustification: text("overrideJustification"),
  overrideTimestamp: timestamp("overrideTimestamp"),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Validation = typeof validations.$inferSelect;
export type InsertValidation = typeof validations.$inferInsert;

/**
 * Contracts table - stores signed contract information
 */
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractId: varchar("contractId", { length: 64 }).notNull().unique(),
  merchantId: varchar("merchantId", { length: 64 }).notNull(),
  sourceCallId: varchar("sourceCallId", { length: 64 }).references(() => callTranscriptions.callId),
  contractPdfUrl: text("contractPdfUrl").notNull(),
  contractPdfKey: text("contractPdfKey").notNull(),
  contractSignedAt: timestamp("contractSignedAt"),
  uploadedBy: int("uploadedBy").notNull().references(() => users.id),
  contractStatus: mysqlEnum("contractStatus", ["uploaded", "extracting", "validated", "validated_with_warnings", "validated_minor_notes", "blocked_high_discrepancy", "failed"]).default("uploaded").notNull(),
  extractedTerms: json("extractedTerms").$type<{
    commission?: string;
    campaignType?: string;
    campaignDuration?: string;
    tabletIncluded?: boolean;
    tabletModel?: string;
    contractLength?: string;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

/**
 * Contract audits table - stores contract vs call comparison results
 */
export const contractAudits = mysqlTable("contract_audits", {
  id: int("id").autoincrement().primaryKey(),
  auditId: varchar("auditId", { length: 64 }).notNull().unique(),
  contractId: varchar("contractId", { length: 64 }).notNull().references(() => contracts.contractId),
  auditTimestamp: timestamp("auditTimestamp").defaultNow().notNull(),
  discrepanciesFound: boolean("discrepanciesFound").default(false),
  discrepancyCount: int("discrepancyCount").default(0),
  discrepancies: json("discrepancies").$type<Array<{
    field: string;
    verbalPromise: string;
    contractTerm: string;
    callTimestamp?: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    impact: string;
  }>>(),
  highestSeverity: mysqlEnum("highestSeverity", ["HIGH", "MEDIUM", "LOW", "NONE"]),
  actionRequired: varchar("actionRequired", { length: 100 }),
  blocksGoLive: boolean("blocksGoLive").default(false),
  sla: varchar("sla", { length: 50 }),
  assignedTo: int("assignedTo").references(() => users.id),
  resolvedBy: int("resolvedBy").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  resolutionNotes: text("resolutionNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContractAudit = typeof contractAudits.$inferSelect;
export type InsertContractAudit = typeof contractAudits.$inferInsert;

/**
 * Exception logs table - stores all exceptions and routing decisions
 */
export const exceptionLogs = mysqlTable("exception_logs", {
  id: int("id").autoincrement().primaryKey(),
  exceptionId: varchar("exceptionId", { length: 64 }).notNull().unique(),
  exceptionType: mysqlEnum("exceptionType", ["data_quality", "validation_failure", "audit_discrepancy", "extraction_error", "system_error"]).notNull(),
  priority: mysqlEnum("priority", ["P0", "P1", "P2", "P3"]).notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: varchar("relatedEntityId", { length: 64 }),
  description: text("description").notNull(),
  errorDetails: json("errorDetails"),
  assignedTo: int("assignedTo").references(() => users.id),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  resolvedBy: int("resolvedBy").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  resolutionNotes: text("resolutionNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExceptionLog = typeof exceptionLogs.$inferSelect;
export type InsertExceptionLog = typeof exceptionLogs.$inferInsert;

/**
 * Notifications table - stores system notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: varchar("notificationId", { length: 64 }).notNull().unique(),
  recipientId: int("recipientId").notNull().references(() => users.id),
  notificationType: mysqlEnum("notificationType", ["handover", "discrepancy", "validation_required", "extraction_complete", "system_alert"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: varchar("relatedEntityId", { length: 64 }),
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Validation rules table - stores configurable validation rules
 */
export const validationRules = mysqlTable("validation_rules", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: varchar("ruleId", { length: 64 }).notNull().unique(),
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  ruleType: mysqlEnum("ruleType", ["mandatory_field", "confidence_threshold", "business_logic"]).notNull(),
  ruleConfig: json("ruleConfig").$type<{
    field?: string;
    threshold?: number;
    condition?: string;
    errorMessage?: string;
  }>(),
  isActive: boolean("isActive").default(true),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ValidationRule = typeof validationRules.$inferSelect;
export type InsertValidationRule = typeof validationRules.$inferInsert;
