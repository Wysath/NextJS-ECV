import type { NextRequest } from "next/server";
import { getPaintings } from "@/lib/museum-api";
import {
  EMPTY_FILTERS,
  filterPaintings,
  highlightMatches,
  toSearchQuery,
  type Painting,
  type SearchPreviewResponse,
} from "@/lib/paintings";

const PREVIEW_LIMIT = 5;

// Left uncached, the Route Handler default: the answer depends on the query, and getPaintings already reads
// from the hourly data cache, so a request costs a filter over the collection rather than an API call.
export async function GET(request: NextRequest) {
  const query = toSearchQuery(request.nextUrl.searchParams.get("q") ?? "");
  if (!query) return Response.json({ query, total: 0, results: [] } satisfies SearchPreviewResponse);

  // Same matching as the listing page, so the preview never promises results the page will not show
  const matches = filterPaintings(await getPaintings(), { ...EMPTY_FILTERS, q: query });
  // A match in the title is most likely the work being looked for, ahead of one in the artist or movement
  const isTitleMatch = (painting: Painting) =>
    [painting.title, painting.originalTitle].some((title) => highlightMatches(title, query).some((part) => part.isMatch));
  const ranked = matches.toSorted((a, b) => Number(isTitleMatch(b)) - Number(isTitleMatch(a)));

  return Response.json({
    query,
    total: matches.length,
    results: ranked.slice(0, PREVIEW_LIMIT).map(({ slug, title, artist, year, image }) => ({ slug, title, artist, year, image })),
  } satisfies SearchPreviewResponse);
}
