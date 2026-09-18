import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { PASSWORD_RULES } from "@/lib/auth-validation";

// No "server-only" import here: the Better Auth CLI loads this file outside Next to generate the schema, and the
// database module already refuses to run without its server-side secret
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_RULES.minLength,
    maxPasswordLength: PASSWORD_RULES.maxLength,
  },
  user: {
    changeEmail: {
      enabled: true,
      // No email service is wired: addresses are never verified, so a change applies at once
      updateEmailWithoutVerification: true,
    },
    // The form always sends the password, which Better Auth checks before deleting
    deleteUser: { enabled: true },
  },
  // Must stay last: it sets the cookies of auth calls made from Server Actions
  plugins: [nextCookies()],
});
