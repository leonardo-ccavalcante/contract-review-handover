import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authenticated user
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.user.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Sales Manager procedure - requires Sales Manager or Regional Director role
 */
export const salesManagerProcedure = protectedProcedure.use(({ ctx, next }) => {
  const authorizedRoles = ['Sales Manager', 'Regional Director', 'Admin'];

  if (!authorizedRoles.includes(ctx.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only Sales Managers and Regional Directors can perform this action',
    });
  }

  return next({ ctx });
});
