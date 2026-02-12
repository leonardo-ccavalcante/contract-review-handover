import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  callTranscriptions,
  InsertCallTranscription,
  CallTranscription,
  merchantProfiles,
  InsertMerchantProfile,
  MerchantProfile,
  aiExtractions,
  InsertAiExtraction,
  AiExtraction,
  validations,
  InsertValidation,
  Validation,
  contracts,
  InsertContract,
  Contract,
  contractAudits,
  InsertContractAudit,
  ContractAudit,
  exceptionLogs,
  InsertExceptionLog,
  ExceptionLog,
  notifications,
  InsertNotification,
  Notification,
  validationRules,
  InsertValidationRule,
  ValidationRule
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ============ CALL TRANSCRIPTION OPERATIONS ============

export async function createCallTranscription(data: InsertCallTranscription): Promise<CallTranscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(callTranscriptions).values(data);
  const insertId = result[0].insertId;
  
  return await getCallTranscriptionById(Number(insertId));
}

export async function getCallTranscriptionById(id: number): Promise<CallTranscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(callTranscriptions).where(eq(callTranscriptions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCallTranscriptionByCallId(callId: string): Promise<CallTranscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(callTranscriptions).where(eq(callTranscriptions.callId, callId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCallTranscriptions() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(callTranscriptions).orderBy(desc(callTranscriptions.uploadTimestamp));
}

export async function updateCallTranscriptionStatus(callId: string, status: CallTranscription["status"]) {
  const db = await getDb();
  if (!db) return;

  await db.update(callTranscriptions).set({ status }).where(eq(callTranscriptions.callId, callId));
}

// ============ MERCHANT PROFILE OPERATIONS ============

export async function createMerchantProfile(data: InsertMerchantProfile): Promise<MerchantProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(merchantProfiles).values(data);
  const insertId = result[0].insertId;
  
  return await getMerchantProfileById(Number(insertId));
}

export async function getMerchantProfileById(id: number): Promise<MerchantProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(merchantProfiles).where(eq(merchantProfiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMerchantProfileByProfileId(profileId: string): Promise<MerchantProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(merchantProfiles).where(eq(merchantProfiles.profileId, profileId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMerchantProfilesByMerchantId(merchantId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(merchantProfiles)
    .where(eq(merchantProfiles.merchantId, merchantId))
    .orderBy(desc(merchantProfiles.profileVersion));
}

export async function getAllMerchantProfiles() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(merchantProfiles).orderBy(desc(merchantProfiles.createdAt));
}

export async function getMerchantProfilesByAccountManager(amId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(merchantProfiles)
    .where(eq(merchantProfiles.assignedAccountManager, amId))
    .orderBy(desc(merchantProfiles.createdAt));
}

export async function updateMerchantProfile(profileId: string, data: Partial<InsertMerchantProfile>) {
  const db = await getDb();
  if (!db) return;

  await db.update(merchantProfiles).set(data).where(eq(merchantProfiles.profileId, profileId));
}

// ============ AI EXTRACTION OPERATIONS ============

export async function createAiExtraction(data: InsertAiExtraction): Promise<AiExtraction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(aiExtractions).values(data);
  const insertId = result[0].insertId;
  
  return await getAiExtractionById(Number(insertId));
}

export async function getAiExtractionById(id: number): Promise<AiExtraction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(aiExtractions).where(eq(aiExtractions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAiExtractionByExtractionId(extractionId: string): Promise<AiExtraction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(aiExtractions).where(eq(aiExtractions.extractionId, extractionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAiExtractionByCallId(callId: string): Promise<AiExtraction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(aiExtractions).where(eq(aiExtractions.callId, callId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ VALIDATION OPERATIONS ============

export async function createValidation(data: InsertValidation): Promise<Validation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(validations).values(data);
  const insertId = result[0].insertId;
  
  return await getValidationById(Number(insertId));
}

export async function getValidationById(id: number): Promise<Validation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(validations).where(eq(validations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getValidationByValidationId(validationId: string): Promise<Validation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(validations).where(eq(validations.validationId, validationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getValidationByExtractionId(extractionId: string): Promise<Validation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(validations).where(eq(validations.extractionId, extractionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateValidation(validationId: string, data: Partial<InsertValidation>) {
  const db = await getDb();
  if (!db) return;

  await db.update(validations).set(data).where(eq(validations.validationId, validationId));
}

export async function getPendingValidations() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(validations)
    .where(eq(validations.validationStatus, "MANUAL_REVIEW"))
    .orderBy(desc(validations.validationTimestamp));
}

// ============ CONTRACT OPERATIONS ============

export async function createContract(data: InsertContract): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(contracts).values(data);
  const insertId = result[0].insertId;
  
  return await getContractById(Number(insertId));
}

export async function getContractById(id: number): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getContractByContractId(contractId: string): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(contracts).where(eq(contracts.contractId, contractId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllContracts() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(contracts).orderBy(desc(contracts.createdAt));
}

export async function updateContractStatus(contractId: string, status: Contract["contractStatus"]) {
  const db = await getDb();
  if (!db) return;

  await db.update(contracts).set({ contractStatus: status }).where(eq(contracts.contractId, contractId));
}

export async function updateContractExtractedTerms(contractId: string, extractedTerms: Contract["extractedTerms"]) {
  const db = await getDb();
  if (!db) return;

  await db.update(contracts).set({ extractedTerms }).where(eq(contracts.contractId, contractId));
}

// ============ CONTRACT AUDIT OPERATIONS ============

export async function createContractAudit(data: InsertContractAudit): Promise<ContractAudit | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(contractAudits).values(data);
  const insertId = result[0].insertId;
  
  return await getContractAuditById(Number(insertId));
}

export async function getContractAuditById(id: number): Promise<ContractAudit | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(contractAudits).where(eq(contractAudits.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getContractAuditByAuditId(auditId: string): Promise<ContractAudit | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(contractAudits).where(eq(contractAudits.auditId, auditId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getContractAuditByContractId(contractId: string): Promise<ContractAudit | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(contractAudits).where(eq(contractAudits.contractId, contractId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllContractAudits() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(contractAudits).orderBy(desc(contractAudits.auditTimestamp));
}

export async function getUnresolvedAudits() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(contractAudits)
    .where(sql`${contractAudits.resolvedAt} IS NULL`)
    .orderBy(desc(contractAudits.auditTimestamp));
}

export async function updateContractAuditResolution(auditId: string, resolvedBy: number, resolutionNotes: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(contractAudits).set({
    resolvedBy,
    resolvedAt: new Date(),
    resolutionNotes
  }).where(eq(contractAudits.auditId, auditId));
}

// ============ EXCEPTION LOG OPERATIONS ============

export async function createExceptionLog(data: InsertExceptionLog): Promise<ExceptionLog | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(exceptionLogs).values(data);
  const insertId = result[0].insertId;
  
  return await getExceptionLogById(Number(insertId));
}

export async function getExceptionLogById(id: number): Promise<ExceptionLog | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(exceptionLogs).where(eq(exceptionLogs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllExceptionLogs() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(exceptionLogs).orderBy(desc(exceptionLogs.createdAt));
}

export async function getOpenExceptionLogs() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(exceptionLogs)
    .where(eq(exceptionLogs.status, "open"))
    .orderBy(desc(exceptionLogs.createdAt));
}

export async function updateExceptionLogStatus(exceptionId: string, status: ExceptionLog["status"]) {
  const db = await getDb();
  if (!db) return;

  await db.update(exceptionLogs).set({ status }).where(eq(exceptionLogs.exceptionId, exceptionId));
}

export async function resolveExceptionLog(exceptionId: string, resolvedBy: number, resolutionNotes: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(exceptionLogs).set({
    status: "resolved",
    resolvedBy,
    resolvedAt: new Date(),
    resolutionNotes
  }).where(eq(exceptionLogs.exceptionId, exceptionId));
}

// ============ NOTIFICATION OPERATIONS ============

export async function createNotification(data: InsertNotification): Promise<Notification | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(notifications).values(data);
  const insertId = result[0].insertId;
  
  return await getNotificationById(Number(insertId));
}

export async function getNotificationById(id: number): Promise<Notification | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications)
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications)
    .where(and(
      eq(notifications.recipientId, userId),
      eq(notifications.isRead, false)
    ))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications).set({
    isRead: true,
    readAt: new Date()
  }).where(eq(notifications.notificationId, notificationId));
}

// ============ VALIDATION RULE OPERATIONS ============

export async function createValidationRule(data: InsertValidationRule): Promise<ValidationRule | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(validationRules).values(data);
  const insertId = result[0].insertId;
  
  return await getValidationRuleById(Number(insertId));
}

export async function getValidationRuleById(id: number): Promise<ValidationRule | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(validationRules).where(eq(validationRules.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllValidationRules() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(validationRules).orderBy(desc(validationRules.createdAt));
}

export async function getActiveValidationRules() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(validationRules)
    .where(eq(validationRules.isActive, true))
    .orderBy(desc(validationRules.createdAt));
}

export async function updateValidationRule(ruleId: string, data: Partial<InsertValidationRule>) {
  const db = await getDb();
  if (!db) return;

  await db.update(validationRules).set(data).where(eq(validationRules.ruleId, ruleId));
}

export async function toggleValidationRuleStatus(ruleId: string, isActive: boolean) {
  const db = await getDb();
  if (!db) return;

  await db.update(validationRules).set({ isActive }).where(eq(validationRules.ruleId, ruleId));
}
