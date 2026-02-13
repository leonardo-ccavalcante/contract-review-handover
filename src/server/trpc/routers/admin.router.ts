import { z } from 'zod';
import { router, protectedProcedure, salesManagerProcedure } from '../trpc';
import { adminService } from '../../services/AdminService';
import { TRPCError } from '@trpc/server';

// Admin-only guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'Admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const adminRouter = router({

  // ── System stats ────────────────────────────────────────
  getSystemStats: protectedProcedure.query(async () => {
    return adminService.getSystemStats();
  }),

  // ── Exceptions ──────────────────────────────────────────
  listExceptions: protectedProcedure
    .input(z.object({
      status:   z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'IGNORED']).optional(),
      severity: z.enum(['P1', 'P2', 'P3', 'P4']).optional(),
      search:   z.string().optional(),
      limit:    z.number().min(1).max(200).default(50),
      offset:   z.number().min(0).default(0),
    }))
    .query(async ({ input }) => adminService.listExceptions(input)),

  resolveException: protectedProcedure
    .input(z.object({
      exceptionId: z.string(),
      notes: z.string().min(10),
    }))
    .mutation(async ({ input, ctx }) =>
      adminService.resolveException(input.exceptionId, ctx.user.id, input.notes)
    ),

  // ── Users ───────────────────────────────────────────────
  listUsers: adminProcedure
    .input(z.object({
      role:   z.string().optional(),
      active: z.boolean().optional(),
      search: z.string().optional(),
    }).default({}))
    .query(async ({ input }) => adminService.listUsers(input)),

  createUser: adminProcedure
    .input(z.object({
      name:   z.string().min(2),
      email:  z.string().email(),
      role:   z.enum(['Admin', 'Sales Manager', 'Regional Director', 'Sales Ops', 'Account Manager']),
      team:   z.string().optional(),
      region: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => adminService.createUser(input, ctx.user.id)),

  updateUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      name:   z.string().min(2).optional(),
      role:   z.enum(['Admin', 'Sales Manager', 'Regional Director', 'Sales Ops', 'Account Manager']).optional(),
      team:   z.string().optional(),
      region: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { userId, ...updates } = input;
      return adminService.updateUser(userId, updates);
    }),

  deactivateUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => adminService.deactivateUser(input.userId, ctx.user.id)),

  // ── System Settings ──────────────────────────────────────
  getSettings: adminProcedure.query(async () => adminService.getSettings()),

  setSetting: adminProcedure
    .input(z.object({
      key:         z.string(),
      value:       z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) =>
      adminService.setSetting(input.key, input.value, ctx.user.id, input.description)
    ),

  // ── Validation Rules ──────────────────────────────────────
  getValidationRules: protectedProcedure.query(async () => adminService.getValidationRules()),

  updateValidationRules: adminProcedure
    .input(z.object({
      ruleId:               z.string(),
      confidence_threshold: z.number().min(50).max(100).optional(),
      mandatory_fields:     z.array(z.string()).optional(),
      override_requires_justification_min_chars: z.number().min(10).max(500).optional(),
      sales_ops_sla_hours:  z.number().min(1).max(72).optional(),
      notes:                z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { ruleId, ...updates } = input;
      return adminService.updateValidationRules(ruleId, updates, ctx.user.id);
    }),

  // ── Notifications ─────────────────────────────────────────
  getNotifications: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().default(false) }))
    .query(async ({ input, ctx }) =>
      adminService.getNotifications(ctx.user.id, input.unreadOnly)
    ),

  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input }) => adminService.markNotificationRead(input.notificationId)),

  markAllRead: protectedProcedure
    .mutation(async ({ ctx }) => adminService.markAllRead(ctx.user.id)),
});
