import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorite } from "@/db/schema";

// Every query is scoped to a user id taken from the verified session, never from the client

export async function getFavoriteSlugs(userId: string) {
  const rows = await db
    .select({ slug: favorite.paintingSlug })
    .from(favorite)
    .where(eq(favorite.userId, userId))
    .orderBy(desc(favorite.createdAt));
  return rows.map((row) => row.slug);
}

export async function isFavorite(userId: string, paintingSlug: string) {
  const [row] = await db
    .select({ id: favorite.id })
    .from(favorite)
    .where(and(eq(favorite.userId, userId), eq(favorite.paintingSlug, paintingSlug)))
    .limit(1);
  return Boolean(row);
}

export async function addFavorite(userId: string, paintingSlug: string) {
  // Idempotent: a second tab or a replayed request must not fail on the unique constraint
  await db.insert(favorite).values({ userId, paintingSlug }).onConflictDoNothing();
}

export async function removeFavorite(userId: string, paintingSlug: string) {
  await db.delete(favorite).where(and(eq(favorite.userId, userId), eq(favorite.paintingSlug, paintingSlug)));
}
