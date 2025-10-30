import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create PostgreSQL connection
const connectionString = process.env.DATABASE_URL!;

// For queries
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// For migrations (disable prepared statements)
const migrationClient = postgres(connectionString, { max: 1 });
export const migrationDb = drizzle(migrationClient, { schema });
