import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPaintings } from "@/lib/museum-api";
import { EMPTY_FILTERS, filtersToHref, groupByTheme } from "@/lib/paintings";
import { getShareImageUrl } from "@/lib/wikimedia";

// Follows the collection: the sitemap is rebuilt with the painting pages rather than frozen at build time
export const revalidate = 3600;

const url = (path: string) => `${siteConfig.url}${path}`;

// No lastModified anywhere: neither the API nor the editorial content carries a real modification date, and one
// set to the generation time would move at every revalidation, which is exactly what makes crawlers drop the field
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paintings = await getPaintings();

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/tableaux"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/billetterie"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/a-propos"), changeFrequency: "yearly", priority: 0.5 },
  ];

  // Only the theme filter: it is the one the painting pages declare as canonical, the others are near-duplicates
  const themePages: MetadataRoute.Sitemap = groupByTheme(paintings).map(({ theme }) => ({
    url: url(filtersToHref({ ...EMPTY_FILTERS, theme: theme.slug })),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const paintingPages: MetadataRoute.Sitemap = paintings.map((painting) => ({
    url: url(`/tableaux/${painting.slug}`),
    changeFrequency: "yearly",
    priority: 0.6,
    images: painting.image ? [getShareImageUrl(painting.image)] : undefined,
  }));

  return [...staticPages, ...themePages, ...paintingPages];
}
