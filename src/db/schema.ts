import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Generated Better Auth tables live in auth-schema.ts, which the CLI overwrites: project tables belong here
export * from "./auth-schema";

export const favorite = pgTable(
  "favorite",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // The slug, not the API id: it is what the painting pages and the catalogue lookups are keyed on
    paintingSlug: text("painting_slug").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // Also what makes a double click unable to save the same painting twice
    unique("favorite_user_painting_unique").on(table.userId, table.paintingSlug),
    index("favorite_user_created_idx").on(table.userId, table.createdAt),
  ],
);
