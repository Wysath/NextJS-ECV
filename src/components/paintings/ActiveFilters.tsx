import Link from "next/link";
import { CloseIcon } from "@/components/ui/icons";
import { PERIODS, filtersToHref, getTheme, type PaintingFilters } from "@/lib/paintings";

type ActiveFiltersProps = {
  filters: PaintingFilters;
  count: number;
};

type Chip = { key: keyof PaintingFilters; label: string };

export function ActiveFilters({ filters, count }: ActiveFiltersProps) {
  const chips: Chip[] = [];
  if (filters.q) chips.push({ key: "q", label: `« ${filters.q} »` });
  const theme = getTheme(filters.theme);
  if (theme) chips.push({ key: "theme", label: theme.label });
  if (filters.movement) chips.push({ key: "movement", label: filters.movement });
  const period = PERIODS.find((option) => option.value === filters.period);
  if (period) chips.push({ key: "period", label: period.label });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p aria-live="polite" className="mr-3 text-small text-ink-muted">
        {count} {count > 1 ? "œuvres" : "œuvre"}
      </p>
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={filtersToHref({ ...filters, [chip.key]: "" })}
          scroll={false}
          aria-label={`Retirer le filtre ${chip.label}`}
          className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-1.5 text-small transition-colors hover:bg-ink hover:text-paper"
        >
          {chip.label}
          <CloseIcon className="size-3.5" />
        </Link>
      ))}
      {chips.length > 0 && (
        <Link
          href={filtersToHref({ ...filters, q: "", theme: "", movement: "", period: "" })}
          scroll={false}
          className="link-underline pb-0.5 text-small"
        >
          Tout effacer
        </Link>
      )}
    </div>
  );
}
