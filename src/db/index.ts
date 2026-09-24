import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// trim() so a blank value set on a host fails here with this message rather than deeper in the driver
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl)
  throw new Error(
    "DATABASE_URL is missing: set Neon's pooled connection string in .env.local for local work, or in the environment variables of the host when deploying",
  );

// The HTTP driver opens no connection pool, so each serverless invocation costs a single fetch
export const db = drizzle(neon(databaseUrl), { schema });
