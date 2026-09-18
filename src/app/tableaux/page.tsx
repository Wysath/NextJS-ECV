import type { Metadata } from "next";
import Link from "next/link";
import { ActiveFilters } from "@/components/paintings/ActiveFilters";
import { PaintingCard } from "@/components/paintings/PaintingCard";
import { PaintingFilters } from "@/components/paintings/PaintingFilters";
import { ThemeNav } from "@/components/paintings/ThemeNav";
import { PageHero } from "@/components/ui/PageHero";
import { getPaintings } from "@/lib/museum-api";
import { EMPTY_FILTERS, filterPaintings, filtersToHref, getMovements, getTheme, parseFilters } from "@/lib/paintings";

const DEFAULT_DESCRIPTION =
  "Parcourez les chefs-d’œuvre de la peinture et filtrez-les par thème, mouvement artistique, période ou artiste.";

// Theme pages are real entry points (linked from the home page), so each gets its own title and canonical URL.
// Other filter combinations fall back to the theme or to the full list, to avoid indexing near-duplicates.
export async function generateMetadata({ searchParams }: PageProps<"/tableaux">): Promise<Metadata> {
  const theme = getTheme(parseFilters(await searchParams).theme);
  return {
    title: theme ? `${theme.label}, tableaux` : "Tableaux",
    description: theme?.description ?? DEFAULT_DESCRIPTION,
    alternates: { canonical: theme ? filtersToHref({ ...EMPTY_FILTERS, theme: theme.slug }) : "/tableaux" },
  };
}

// Reading searchParams makes this page render per request (SSR), while the API data stays cached
export default async function PaintingsPage({ searchParams }: PageProps<"/tableaux">) {
  const filters = parseFilters(await searchParams);
  const paintings = await getPaintings();
  const results = filterPaintings(paintings, filters);
  const theme = getTheme(filters.theme);

  return (
    <>
      {/* Keyed by theme: the split title must remount when it changes, SplitText cannot patch its text */}
      <PageHero
        key={theme?.slug ?? "tous"}
        title={theme?.label ?? "Tableaux"}
        intro={
          theme?.description ??
          "Une sélection de chefs-d’œuvre conservés dans les grands musées du monde, des primitifs flamands au surréalisme. Affinez par thème, mouvement, période ou artiste."
        }
      />

      <section className="group/results wrapper pb-section">
        <ThemeNav filters={filters} />
        <div className="mt-8">
          <PaintingFilters movements={getMovements(paintings)} filters={filters} />
        </div>
        <div className="mt-6">
          <ActiveFilters filters={filters} count={results.length} />
        </div>

        {results.length > 0 ? (
          <ul className="mt-14 grid items-end gap-x-8 gap-y-16 transition-opacity duration-300 group-has-data-pending/results:opacity-40 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((painting, index) => (
              <li key={painting.id}>
                <PaintingCard
                  painting={painting}
                  headingAs="h2"
                  revealDelay={(index % 3) * 0.06}
                  highlight={filters.q}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-14 border-t pt-14">
            <p className="type-statement text-h3">Aucune œuvre ne correspond à ces critères.</p>
            <Link href="/tableaux" scroll={false} className="link-underline link-cta mt-6">
              Réinitialiser les filtres
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
