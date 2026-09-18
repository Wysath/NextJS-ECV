"use server";

import { revalidatePath } from "next/cache";
import { addFavorite, removeFavorite } from "@/lib/favorites";
import { getPainting } from "@/lib/museum-api";
import { getSession } from "@/lib/session";

export type FavoriteResult = { ok: true; isFavorite: boolean } | { ok: false; reason: "unauthenticated" | "unknown-painting" };

// A Server Action is a public endpoint: the user comes from the session and the slug is checked against the catalogue,
// so nobody can write favorites for someone else or fill the table with made-up slugs
export async function setFavorite(paintingSlug: string, shouldBeFavorite: boolean): Promise<FavoriteResult> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "unauthenticated" };

  if (shouldBeFavorite) {
    // getPainting rather than the collection index, which can lag an hour behind a newly published painting
    if (!(await getPainting(paintingSlug))) return { ok: false, reason: "unknown-painting" };
    await addFavorite(session.user.id, paintingSlug);
  } else {
    await removeFavorite(session.user.id, paintingSlug);
  }

  // The account gallery is rendered per request, but the client router may still hold its previous payload
  revalidatePath("/compte");
  return { ok: true, isFavorite: shouldBeFavorite };
}
