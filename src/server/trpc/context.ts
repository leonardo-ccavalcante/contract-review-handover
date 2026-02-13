import type { Request, Response } from 'express';
import { db } from '../db';

/**
 * tRPC Context
 *
 * Context available to all tRPC procedures
 * Includes database connection and user session
 */
export const createContext = async ({ req, res }: { req: Request; res: Response }) => {
  // TODO: Add authentication logic here (Manus OAuth)
  // For now, we'll extract user from Authorization header or session

  const user = {
    id: req.headers['x-user-id'] as string,
    role: req.headers['x-user-role'] as string,
    email: req.headers['x-user-email'] as string,
  };

  return {
    db,
    user,
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
