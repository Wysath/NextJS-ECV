import "server-only";
import { getFavoriteSlugs } from "@/lib/favorites";
import { getPainting, getPaintings } from "@/lib/museum-api";
import type { Painting } from "@/lib/paintings";

export type FavoritePainting = Pick<Painting, "slug" | "title" | "artist" | "year" | "image">;

// Joins the saved slugs with the catalogue, keeping the order in which they were saved (newest first)
export async function getFavoritePaintings(userId: string): Promise<FavoritePainting[]> {
  const [slugs, paintings] = await Promise.all([getFavoriteSlugs(userId), getPaintings()]);
  const bySlug = new Map(paintings.map((painting) => [painting.slug, painting]));

  const resolved = await Promise.all(
    // A painting missing from the hourly index is looked up alone; one removed from the API is skipped
    slugs.map((slug) => bySlug.get(slug) ?? getPainting(slug)),
  );
  return resolved
    .filter((painting) => painting !== null && painting !== undefined)
    .map(({ slug, title, artist, year, image }) => ({ slug, title, artist, year, image }));
}
