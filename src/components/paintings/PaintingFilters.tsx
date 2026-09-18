"use client";

import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  DEFAULT_SORT,
  PERIODS,
  SORTS,
  filtersToHref,
  toSearchQuery,
  type PaintingFilters as Filters,
} from "@/lib/paintings";

const SEARCH_DEBOUNCE_MS = 300;

type PaintingFiltersProps = {
  movements: string[];
  filters: Filters;
};

// The URL is the single source of truth: results are filtered on the server from searchParams,
// so every state can be shared, bookmarked and indexed.
export function PaintingFilters({ movements, filters }: PaintingFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Selects show the new value immediately instead of snapping back until the server answers
  const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  // Syncs the input when the query changes elsewhere (header search, removed chip), but never while the user types
  useEffect(() => {
    const input = searchInputRef.current;
    if (input && document.activeElement !== input) input.value = filters.q;
  }, [filters.q]);

  useEffect(() => () => window.clearTimeout(debounceRef.current), []);

  const updateFilter = (key: keyof Filters, value: string) => {
    const nextFilters = { ...optimisticFilters, [key]: value };
    startTransition(() => {
      setOptimisticFilters(nextFilters);
      router.replace(filtersToHref(nextFilters), { scroll: false });
    });
  };

  const scheduleSearch = (value: string) => {
    window.clearTimeout(debounceRef.current);
    // Dropping back under the minimum clears the search; staying under it without one skips a useless server round trip
    const query = toSearchQuery(value);
    if (query === filters.q) return;
    debounceRef.current = window.setTimeout(() => updateFilter("q", query), SEARCH_DEBOUNCE_MS);
  };

  return (
    <form
      action="/tableaux"
      method="get"
      role="search"
      aria-label="Filtrer les tableaux"
      data-pending={isPending || undefined}
      onSubmit={(event) => {
        event.preventDefault();
        window.clearTimeout(debounceRef.current);
        updateFilter("q", toSearchQuery(searchInputRef.current?.value ?? ""));
      }}
      className="grid gap-5 border-y py-6 md:grid-cols-12 md:items-end"
    >
      <div className="md:col-span-4">
        <label htmlFor="filter-q" className="eyebrow text-ink-muted">
          Recherche
        </label>
        <div className="relative mt-3">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            ref={searchInputRef}
            id="filter-q"
            name="q"
            type="search"
            autoComplete="off"
            defaultValue={filters.q}
            onChange={(event) => scheduleSearch(event.target.value)}
            placeholder="Titre, artiste, mouvement…"
            className="h-12 w-full rounded-full border bg-transparent pr-4 pl-11 transition-colors placeholder:text-ink-muted hover:border-ink focus:border-ink"
          />
        </div>
      </div>

      <FilterSelect
        id="filter-movement"
        name="mouvement"
        label="Mouvement"
        value={optimisticFilters.movement}
        placeholder="Tous les mouvements"
        options={movements.map((movement) => ({ value: movement, label: movement }))}
        onChange={(value) => updateFilter("movement", value)}
        className="md:col-span-3"
      />
      <FilterSelect
        id="filter-period"
        name="periode"
        label="Période"
        value={optimisticFilters.period}
        placeholder="Toutes les périodes"
        options={PERIODS.map(({ value, label }) => ({ value, label }))}
        onChange={(value) => updateFilter("period", value)}
        className="md:col-span-2"
      />
      <FilterSelect
        id="filter-sort"
        name="tri"
        label="Trier"
        value={optimisticFilters.sort || DEFAULT_SORT}
        options={SORTS.map(({ value, label }) => ({ value, label }))}
        // The default sort stays out of the URL to keep one canonical address per result set
        onChange={(value) => updateFilter("sort", value === DEFAULT_SORT ? "" : value)}
        className="md:col-span-3"
      />

      {/* Only reachable without JavaScript, where the form falls back to a plain GET submission */}
      <button type="submit" className="sr-only">
        Appliquer les filtres
      </button>
      <p aria-live="polite" className="sr-only">
        {isPending ? "Mise à jour des résultats" : ""}
      </p>
    </form>
  );
}

type FilterSelectProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  className?: string;
};

function FilterSelect({ id, name, label, value, placeholder, options, onChange, className }: FilterSelectProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow text-ink-muted">
        {label}
      </label>
      <div className="relative mt-3">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-12 w-full cursor-pointer appearance-none rounded-full border bg-transparent pr-10 pl-4 transition-colors hover:border-ink focus:border-ink",
            !value && "text-ink-muted",
          )}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
