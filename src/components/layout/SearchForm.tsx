"use client";

import Form from "next/form";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { Highlight } from "@/components/paintings/Highlight";
import { PaintingCoverImage } from "@/components/paintings/PaintingCoverImage";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  EMPTY_FILTERS,
  MIN_SEARCH_LENGTH,
  filtersToHref,
  toSearchQuery,
  type SearchPreviewResponse,
} from "@/lib/paintings";

const PREVIEW_DEBOUNCE_MS = 200;

type SearchFormProps = {
  id: string;
  className?: string;
  // Lets the mobile menu close itself once a search is submitted or a result is chosen
  onSubmit?: () => void;
};

// GET form: without JS it still lands on /tableaux?q=. With JS, a combobox previews the matching works as you type.
export function SearchForm({ id, className, onSubmit }: SearchFormProps) {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const debounceRef = useRef<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasPanelVisibleRef = useRef(false);
  const [preview, setPreview] = useState<SearchPreviewResponse | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [previousPathname, setPreviousPathname] = useState(pathname);

  // Back/forward navigations do not go through our handlers
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  useEffect(
    () => () => {
      window.clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const listboxId = `${id}-suggestions`;
  const results = preview?.results ?? [];
  const isPanelVisible = isOpen && (preview !== null || hasError);
  // Changes only when other works are listed, so refining "mone" into "monet" does not replay the entrance
  const contentKey = hasError ? "error" : results.map((painting) => painting.slug).join("|") || "empty";

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel || !isPanelVisible) {
        wasPanelVisibleRef.current = false;
        return;
      }
      const isOpening = !wasPanelVisibleRef.current;
      wasPanelVisibleRef.current = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // fromTo with explicit end values: a plain from() started mid-tween would freeze rows half transparent
      if (isOpening) {
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: -10, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "reveal", overwrite: true, clearProps: "opacity,visibility,transform" },
        );
      }
      const delay = isOpening ? 0.08 : 0;
      gsap.fromTo(
        panel.querySelectorAll("[data-search-row]"),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "reveal", stagger: 0.05, delay, overwrite: true, clearProps: "opacity,visibility,transform" },
      );
      gsap.fromTo(
        panel.querySelectorAll("[data-search-thumb]"),
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "reveal", stagger: 0.05, delay, overwrite: true, clearProps: "clipPath" },
      );
    },
    { dependencies: [isPanelVisible, contentKey] },
  );

  const search = (value: string) => {
    window.clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setActiveIndex(-1);

    const query = toSearchQuery(value);
    if (!query) {
      setPreview(null);
      setHasError(false);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const response = await fetch(`/api/recherche?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Search preview failed with ${response.status}`);
        setPreview(await response.json());
        setHasError(false);
      } catch {
        // A newer keystroke cancelled this request: its own response will update the panel
        if (controller.signal.aborted) return;
        setHasError(true);
      }
      setIsLoading(false);
    }, PREVIEW_DEBOUNCE_MS);
  };

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const chooseResult = () => {
    close();
    inputRef.current?.blur();
    onSubmit?.();
  };

  // A painting page has nothing to do with the query anymore, unlike the listing that displays it
  const choosePainting = () => {
    chooseResult();
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
  };

  return (
    <Form
      action="/tableaux"
      role="search"
      onSubmit={() => {
        close();
        onSubmit?.();
      }}
      // Focus moving to something outside the form (tab, click elsewhere) closes the preview
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      className={cn("relative", className)}
    >
      <label htmlFor={id} className="sr-only">
        Rechercher une œuvre
      </label>
      <SearchIcon className="pointer-events-none absolute top-5 left-3.5 size-4 -translate-y-1/2 text-ink-muted" />
      <input
        ref={inputRef}
        id={id}
        name="q"
        type="search"
        autoComplete="off"
        // Native validation blocks a one or two character query; an empty submit still opens the full listing
        minLength={MIN_SEARCH_LENGTH}
        placeholder="Rechercher une œuvre…"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isPanelVisible}
        aria-controls={listboxId}
        aria-activedescendant={isPanelVisible && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        onChange={(event) => search(event.target.value)}
        onFocus={() => {
          if (preview) setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isPanelVisible) {
            event.preventDefault();
            close();
            return;
          }
          if (!isPanelVisible || results.length === 0) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            // -1 hands the focus back to the typed text, as in a native datalist
            setActiveIndex((index) => ((index + step + 1 + results.length + 1) % (results.length + 1)) - 1);
          } else if (event.key === "Enter" && activeIndex >= 0) {
            // Going through the link keeps the page curtain and its modifier-key handling
            event.preventDefault();
            optionRefs.current[activeIndex]?.click();
          }
        }}
        className="h-10 w-full rounded-full border bg-transparent pr-4 pl-10 text-small transition-colors placeholder:text-ink-muted hover:border-ink focus:border-ink"
      />

      <div
        ref={panelRef}
        hidden={!isPanelVisible}
        // Keeps the focus in the input on click, otherwise its blur would close the panel before the link receives the click
        onMouseDown={(event) => event.preventDefault()}
        className="absolute top-full right-0 z-10 mt-2 w-full origin-top-right overflow-hidden rounded-2xl border bg-paper shadow-[0_24px_60px_-20px_rgb(26_23_20/0.35)] lg:w-104"
      >
        {hasError ? (
          <p data-search-row className="px-5 py-4 text-small text-ink-muted">
            La recherche est indisponible pour le moment.
          </p>
        ) : results.length === 0 ? (
          <p data-search-row className="px-5 py-4 text-small text-ink-muted">
            Aucune œuvre ne correspond à « {preview?.query} ».
          </p>
        ) : (
          <>
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Œuvres suggérées"
              className={cn("p-2 transition-opacity duration-200", isLoading && "opacity-60")}
            >
              {results.map((painting, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={painting.slug}
                    id={`${listboxId}-${index}`}
                    role="option"
                    aria-selected={isActive}
                    data-search-row
                  >
                    <TransitionLink
                      ref={(node) => {
                        optionRefs.current[index] = node;
                      }}
                      href={`/tableaux/${painting.slug}`}
                      transitionLabel={painting.title}
                      tabIndex={-1}
                      onClick={choosePainting}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "flex items-center gap-4 rounded-xl p-2 transition-colors",
                        isActive && "bg-ink/6",
                      )}
                    >
                      <span data-search-thumb className="relative h-16 w-12 shrink-0 overflow-hidden bg-paper-deep">
                        {painting.image && <PaintingCoverImage image={painting.image} sizes="48px" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display font-medium">
                          <Highlight text={painting.title} query={preview?.query} />
                        </span>
                        <span className="mt-0.5 block truncate text-small text-ink-muted">
                          {painting.artist && <Highlight text={painting.artist} query={preview?.query} />}
                          {painting.artist && painting.year !== null && ", "}
                          {painting.year}
                        </span>
                      </span>
                      <ArrowRightIcon
                        className={cn(
                          "size-4 shrink-0 transition duration-300 ease-museum",
                          isActive ? "opacity-100" : "-translate-x-1 opacity-0",
                        )}
                      />
                    </TransitionLink>
                  </li>
                );
              })}
            </ul>
            {preview && (
              <TransitionLink
                href={filtersToHref({ ...EMPTY_FILTERS, q: preview.query })}
                tabIndex={-1}
                onClick={chooseResult}
                data-search-row
                className="flex items-center justify-between gap-4 border-t px-5 py-3 text-small font-medium transition-colors hover:bg-ink/6"
              >
                {preview.total > 1 ? `Voir les ${preview.total} œuvres` : "Voir dans la galerie"}
                <ArrowRightIcon className="size-4" />
              </TransitionLink>
            )}
          </>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {isPanelVisible && !isLoading && preview
          ? preview.total === 0
            ? "Aucune œuvre trouvée"
            : `${preview.total} œuvre${preview.total > 1 ? "s" : ""} trouvée${preview.total > 1 ? "s" : ""}`
          : ""}
      </p>
    </Form>
  );
}
