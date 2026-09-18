import Link from "next/link";
import { THEMES } from "@/data/themes";
import { filtersToHref, type PaintingFilters } from "@/lib/paintings";

// Links rather than a select: themes are the entry points into the collection, so they stay visible and crawlable
export function ThemeNav({ filters }: { filters: PaintingFilters }) {
  const items = [{ slug: "", label: "Tous les thèmes" }, ...THEMES];

  return (
    <nav aria-label="Thèmes">
      <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {items.map((item) => (
          <li key={item.slug || "tous"} className="shrink-0">
            <Link
              href={filtersToHref({ ...filters, theme: item.slug })}
              scroll={false}
              aria-current={filters.theme === item.slug ? "true" : undefined}
              className="inline-flex h-10 items-center rounded-full border px-5 text-small whitespace-nowrap transition-colors hover:border-ink aria-[current=true]:border-ink aria-[current=true]:bg-ink aria-[current=true]:text-paper"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
