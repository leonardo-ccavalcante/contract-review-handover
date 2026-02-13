import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create Drizzle instance
export const db = drizzle(pool);

// Export schemas
export * from './schema/validationLog.schema';
export * from './schema/aiExtractions.schema';
export * from './schema/merchantProfiles.schema';
export * from './schema/contracts.schema';
export * from './schema/contractAuditLog.schema';
export * from './schema/merchants.schema';
export * from './schema/callTranscriptions.schema';
export * from './schema/profileActivityLog.schema';
export * from './schema/exceptionLog.schema';
export * from './schema/notifications.schema';
export * from './schema/users.schema';
export * from './schema/systemSettings.schema';
export * from './schema/validationRules.schema';
