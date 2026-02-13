import { router } from './trpc';
import { validationRouter } from './routers/validation.router';
import { reportsRouter } from './routers/reports.router';
import { contractAuditRouter } from './routers/contractAudit.router';
import { merchantProfileRouter } from './routers/merchantProfile.router';
import { adminRouter } from './routers/admin.router';

/**
 * Root tRPC Router
 *
 * Combines all sub-routers into a single root router
 */
export const appRouter = router({
  validation: validationRouter,
  reports: reportsRouter,
  contractAudit: contractAuditRouter,
  merchantProfile: merchantProfileRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
