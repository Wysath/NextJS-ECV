import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is missing: copy Neon's pooled connection string into .env.local");

// The HTTP driver opens no connection pool, so each serverless invocation costs a single fetch
export const db = drizzle(neon(databaseUrl), { schema });
