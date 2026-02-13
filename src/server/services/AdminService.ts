import { eq, desc, and, like, isNull, gte, count, sql } from 'drizzle-orm';
import { db } from '../db';
import { exceptionLog } from '../db/schema/exceptionLog.schema';
import { users } from '../db/schema/users.schema';
import { systemSettings } from '../db/schema/systemSettings.schema';
import { validationRules } from '../db/schema/validationRules.schema';
import { notifications } from '../db/schema/notifications.schema';
import { merchants } from '../db/schema/merchants.schema';
import { validationLog } from '../db/schema/validationLog.schema';
import { contractAuditLog } from '../db/schema/contractAuditLog.schema';
import logger from '../utils/logger';
import { randomUUID } from 'crypto';

export class AdminService {

  // ── Exception Log ─────────────────────────────────────────

  async listExceptions(filters: {
    status?: string;
    severity?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { status, severity, search, limit = 50, offset = 0 } = filters;
    const conditions: any[] = [];
    if (status) conditions.push(eq(exceptionLog.status, status as any));
    if (severity) conditions.push(eq(exceptionLog.severity, severity as any));
    if (search) conditions.push(like(exceptionLog.error_message, `%${search}%`));
    const rows = await db
      .select()
      .from(exceptionLog)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(exceptionLog.created_at))
      .limit(limit)
      .offset(offset);
    return rows;
  }

  async resolveException(exceptionId: string, resolvedBy: string, notes: string) {
    await db.update(exceptionLog)
      .set({ status: 'RESOLVED', resolved_by: resolvedBy, resolved_at: new Date(), resolution_notes: notes })
      .where(eq(exceptionLog.exception_id, exceptionId));
    return { success: true };
  }

  async logException(data: {
    exception_type: string;
    severity?: 'P1' | 'P2' | 'P3' | 'P4';
    merchant_id?: string;
    workflow_step?: string;
    error_message: string;
    stack_trace?: string;
    context_data?: Record<string, unknown>;
  }) {
    const id = randomUUID();
    await db.insert(exceptionLog).values({
      exception_id: id,
      exception_type: data.exception_type,
      severity: data.severity ?? 'P2',
      merchant_id: data.merchant_id,
      workflow_step: data.workflow_step,
      error_message: data.error_message,
      stack_trace: data.stack_trace,
      context_data: data.context_data,
    });
    return id;
  }

  // ── User Management ───────────────────────────────────────

  async listUsers(filters: { role?: string; active?: boolean; search?: string } = {}) {
    const { role, active, search } = filters;
    const conditions: any[] = [];
    if (role) conditions.push(eq(users.role, role as any));
    if (active !== undefined) conditions.push(eq(users.is_active, active));
    if (search) {
      conditions.push(sql`(${users.name} LIKE ${`%${search}%`} OR ${users.email} LIKE ${`%${search}%`})`);
    }
    return db.select().from(users)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(users.name);
  }

  async createUser(data: {
    name: string; email: string; role: string; team?: string; region?: string;
  }, performedBy: string) {
    const id = randomUUID();
    await db.insert(users).values({
      user_id: id,
      name: data.name,
      email: data.email,
      role: data.role as any,
      team: data.team,
      region: data.region,
      is_active: true,
    });
    logger.info('User created', { userId: id, performedBy });
    return id;
  }

  async updateUser(userId: string, updates: {
    name?: string; role?: string; team?: string; region?: string;
  }) {
    await db.update(users).set(updates as any).where(eq(users.user_id, userId));
    return { success: true };
  }

  async deactivateUser(userId: string, performedBy: string) {
    await db.update(users).set({ is_active: false }).where(eq(users.user_id, userId));
    logger.info('User deactivated', { userId, performedBy });
    return { success: true };
  }

  // ── System Settings ───────────────────────────────────────

  async getSettings() {
    return db.select().from(systemSettings).orderBy(systemSettings.setting_key);
  }

  async getSetting(key: string): Promise<string | null> {
    const [row] = await db.select().from(systemSettings).where(eq(systemSettings.setting_key, key)).limit(1);
    return row?.setting_value ?? null;
  }

  async setSetting(key: string, value: string, updatedBy: string, description?: string) {
    await db.insert(systemSettings)
      .values({ setting_key: key, setting_value: value, description, updated_by: updatedBy })
      .onDuplicateKeyUpdate({ set: { setting_value: value, updated_by: updatedBy } });
    return { success: true };
  }

  // ── Validation Rules ─────────────────────────────────────

  async getValidationRules() {
    const [rule] = await db.select().from(validationRules).where(eq(validationRules.is_active, true)).limit(1);
    return rule ?? null;
  }

  async updateValidationRules(ruleId: string, updates: {
    confidence_threshold?: number;
    mandatory_fields?: string[];
    override_requires_justification_min_chars?: number;
    sales_ops_sla_hours?: number;
    notes?: string;
  }, updatedBy: string) {
    await db.update(validationRules)
      .set({ ...updates as any, updated_by: updatedBy })
      .where(eq(validationRules.rule_id, ruleId));
    logger.info('Validation rules updated', { ruleId, updatedBy });
    return { success: true };
  }

  // ── Notifications ─────────────────────────────────────────

  async getNotifications(recipientId: string, unreadOnly = false) {
    const conditions: any[] = [eq(notifications.recipient_id, recipientId)];
    if (unreadOnly) conditions.push(eq(notifications.is_read, false));
    return db.select().from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.created_at))
      .limit(50);
  }

  async markNotificationRead(notificationId: string) {
    await db.update(notifications)
      .set({ is_read: true, read_at: new Date() })
      .where(eq(notifications.notification_id, notificationId));
    return { success: true };
  }

  async markAllRead(recipientId: string) {
    await db.update(notifications)
      .set({ is_read: true, read_at: new Date() })
      .where(and(eq(notifications.recipient_id, recipientId), eq(notifications.is_read, false)));
    return { success: true };
  }

  async createNotification(data: {
    recipient_id: string;
    recipient_role?: string;
    notification_type: string;
    title: string;
    message: string;
    entity_type?: string;
    entity_id?: string;
    action_url?: string;
  }) {
    const id = randomUUID();
    await db.insert(notifications).values({ notification_id: id, ...data as any });
    return id;
  }

  // ── System Dashboard Stats ────────────────────────────────

  async getSystemStats() {
    const [merchantCount] = await db.select({ total: count() }).from(merchants);
    const [validationCount] = await db.select({ total: count() }).from(validationLog);
    const [auditCount] = await db.select({ total: count() }).from(contractAuditLog);
    const [openExceptions] = await db.select({ total: count() }).from(exceptionLog)
      .where(eq(exceptionLog.status, 'OPEN'));
    const [p1Exceptions] = await db.select({ total: count() }).from(exceptionLog)
      .where(and(eq(exceptionLog.severity, 'P1'), eq(exceptionLog.status, 'OPEN')));
    return {
      total_merchants: merchantCount.total,
      total_validations: validationCount.total,
      total_audits: auditCount.total,
      open_exceptions: openExceptions.total,
      critical_exceptions: p1Exceptions.total,
    };
  }
}

export const adminService = new AdminService();
