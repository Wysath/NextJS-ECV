// Shared by server and client code: no fetching here, only types and pure helpers

import { THEMES, type Theme } from "@/data/themes";

export type PaintingImage = {
  src: string;
  width?: number;
  height?: number;
  // Lower bound of the original width, known when the exact size could not be fetched
  minOriginalWidth?: number;
};

// The API documents every field as optional, so everything but the identity is nullable
export type Painting = {
  id: number;
  slug: string;
  title: string;
  // Title as sent by the API, kept for the painting page and so the search still finds "starry night"
  originalTitle: string;
  year: number | null;
  type: string | null;
  description: string | null;
  image: PaintingImage | null;
  gallery: PaintingImage[];
  artist: string | null;
  location: string | null;
  locationLink: string | null;
  movement: string | null;
  color: string | null;
};

export const PERIODS = [
  { value: "avant-1500", label: "Avant 1500", min: Number.NEGATIVE_INFINITY, max: 1499 },
  { value: "1500-1699", label: "1500 à 1699", min: 1500, max: 1699 },
  { value: "1700-1899", label: "1700 à 1899", min: 1700, max: 1899 },
  { value: "depuis-1900", label: "Depuis 1900", min: 1900, max: Number.POSITIVE_INFINITY },
] as const;

export const SORTS = [
  { value: "chronologique", label: "Du plus ancien au plus récent" },
  { value: "recent", label: "Du plus récent au plus ancien" },
  { value: "titre", label: "Par titre" },
] as const;

export const DEFAULT_SORT = SORTS[0].value;

export type PaintingFilters = {
  q: string;
  theme: string;
  movement: string;
  period: string;
  sort: string;
};

// French query keys keep the URLs readable for the audience: /tableaux?mouvement=Impressionnisme
export const FILTER_PARAMS = {
  q: "q",
  theme: "theme",
  movement: "mouvement",
  period: "periode",
  sort: "tri",
} as const satisfies Record<keyof PaintingFilters, string>;

export const EMPTY_FILTERS: PaintingFilters = { q: "", theme: "", movement: "", period: "", sort: "" };

// Below three characters a word-start match hits most of the collection, so the search does not run
export const MIN_SEARCH_LENGTH = 3;

export const toSearchQuery = (value: string) => {
  const query = value.trim();
  return query.length >= MIN_SEARCH_LENGTH ? query : "";
};

// Only what the header preview displays crosses the network, not whole paintings with their descriptions
export type SearchPreview = Pick<Painting, "slug" | "title" | "artist" | "year" | "image">;
export type SearchPreviewResponse = { query: string; total: number; results: SearchPreview[] };

export const getTheme = (slug: string) => THEMES.find((theme) => theme.slug === slug);

// Home page entry points: only themes that still match paintings from the API
export function groupByTheme(paintings: Painting[]): Array<{ theme: Theme; paintings: Painting[] }> {
  return THEMES.map((theme) => ({
    theme,
    paintings: paintings.filter((painting) => theme.paintings.includes(painting.slug)),
  })).filter((group) => group.paintings.length > 0);
}

type SearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export function parseFilters(searchParams: SearchParams): PaintingFilters {
  const theme = firstValue(searchParams[FILTER_PARAMS.theme]);
  const period = firstValue(searchParams[FILTER_PARAMS.period]);
  const sort = firstValue(searchParams[FILTER_PARAMS.sort]);

  return {
    // Also enforced here, since a short query can still arrive through a hand-typed URL
    q: toSearchQuery(firstValue(searchParams[FILTER_PARAMS.q])),
    theme: getTheme(theme) ? theme : "",
    movement: firstValue(searchParams[FILTER_PARAMS.movement]),
    period: PERIODS.some((option) => option.value === period) ? period : "",
    sort: SORTS.some((option) => option.value === sort) && sort !== DEFAULT_SORT ? sort : "",
  };
}

export function filtersToHref(filters: PaintingFilters) {
  const params = new URLSearchParams();
  for (const key of Object.keys(FILTER_PARAMS) as Array<keyof PaintingFilters>) {
    if (filters[key]) params.set(FILTER_PARAMS[key], filters[key]);
  }
  const search = params.toString();
  return search ? `/tableaux?${search}` : "/tableaux";
}

// Accent-insensitive so that "dali" finds "Dalí"
const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Shared by the filter and the highlight, so what is marked in a card is exactly what made it match
const getSearchTerms = (query: string) => normalizeText(query).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

const WORD_CHARACTER = /[\p{L}\p{M}\p{N}]/u;

export type TextPart = { text: string; isMatch: boolean };

// Splits a text into plain and matched parts: a word's beginning is matched when a search term starts it
export function highlightMatches(text: string, query: string): TextPart[] {
  const terms = getSearchTerms(query);
  if (terms.length === 0) return [{ text, isMatch: false }];

  const characters = Array.from(text);
  const parts: TextPart[] = [];
  const push = (value: string, isMatch: boolean) => {
    if (!value) return;
    const last = parts.at(-1);
    if (last?.isMatch === isMatch) last.text += value;
    else parts.push({ text: value, isMatch });
  };

  let start = 0;
  while (start < characters.length) {
    if (!WORD_CHARACTER.test(characters[start])) {
      push(characters[start], false);
      start++;
      continue;
    }

    let end = start;
    while (end < characters.length && WORD_CHARACTER.test(characters[end])) end++;
    const word = characters.slice(start, end);
    // Normalized character by character, so a match measured on "dali" maps back onto the original "Dalí"
    const normalizedCharacters = word.map(normalizeText);
    const normalizedWord = normalizedCharacters.join("");
    const matchLength = Math.max(0, ...terms.filter((term) => normalizedWord.startsWith(term)).map((term) => term.length));

    let matchedCount = 0;
    for (let covered = 0; covered < matchLength && matchedCount < word.length; matchedCount++) {
      covered += normalizedCharacters[matchedCount].length;
    }
    push(word.slice(0, matchedCount).join(""), true);
    push(word.slice(matchedCount).join(""), false);
    start = end;
  }
  return parts;
}

const MISSING_YEAR = 1_000_000;

const comparators: Record<string, (a: Painting, b: Painting) => number> = {
  chronologique: (a, b) => (a.year ?? MISSING_YEAR) - (b.year ?? MISSING_YEAR),
  recent: (a, b) => (b.year ?? -MISSING_YEAR) - (a.year ?? -MISSING_YEAR),
  titre: (a, b) => a.title.localeCompare(b.title, "fr"),
};

export function filterPaintings(paintings: Painting[], filters: PaintingFilters) {
  const terms = getSearchTerms(filters.q);
  const period = PERIODS.find((option) => option.value === filters.period);
  const theme = getTheme(filters.theme);

  return paintings
    .filter((painting) => {
      if (theme && !theme.paintings.includes(painting.slug)) return false;
      if (filters.movement && painting.movement !== filters.movement) return false;
      if (period && (painting.year === null || painting.year < period.min || painting.year > period.max)) {
        return false;
      }
      if (terms.length > 0) {
        // Matching word starts only, otherwise "dali" also finds "Odalisque"
        const words = normalizeText([painting.title, painting.originalTitle, painting.artist, painting.movement].join(" ")).split(/[^\p{L}\p{N}]+/u);
        if (!terms.every((term) => words.some((word) => word.startsWith(term)))) return false;
      }
      return true;
    })
    .sort(comparators[filters.sort || DEFAULT_SORT]);
}

export function getMovements(paintings: Painting[]) {
  const movements = paintings.flatMap((painting) => (painting.movement ? [painting.movement] : []));
  return [...new Set(movements)].sort((a, b) => a.localeCompare(b, "fr"));
}

// Same movement weighs most, then same artist, then works painted within half a century
export function getSimilarPaintings(painting: Painting, paintings: Painting[], limit = 3) {
  return paintings
    .filter((candidate) => candidate.slug !== painting.slug)
    .map((candidate) => {
      const yearGap =
        candidate.year !== null && painting.year !== null
          ? Math.abs(candidate.year - painting.year)
          : Number.POSITIVE_INFINITY;
      const score =
        (painting.movement && candidate.movement === painting.movement ? 3 : 0) +
        (painting.artist && candidate.artist === painting.artist ? 2 : 0) +
        (yearGap <= 50 ? 1 : 0);
      return { candidate, score, yearGap };
    })
    .sort((a, b) => b.score - a.score || a.yearGap - b.yearGap)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export type TitleWord = { text: string; isEmphasized: boolean };

// Articles and prepositions ("the", "of", "La") would look accidental in bold
const isMinorWord = (word: string) => word.replace(/[^\p{L}]/gu, "").length <= 3;

// Editorial title on two balanced lines, each with its last significant word in bold. A one-word
// first line stays light, so the bold weight always closes the title.
export function splitTitle(title: string): TitleWord[][] {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [words.map((text) => ({ text, isEmphasized: true }))];

  // A line may not end on an article or a preposition ("La / Joconde" reads as a mistake), so the break moves
  // back; a title that cannot be broken that way ("Le Cri") stays on one line
  let middle = Math.ceil(words.length / 2);
  while (middle > 1 && isMinorWord(words[middle - 1])) middle--;
  const lines = isMinorWord(words[middle - 1]) ? [words] : [words.slice(0, middle), words.slice(middle)];

  return lines.map((line, lineIndex) => {
    const lastSignificantIndex = line.findLastIndex((word) => !isMinorWord(word));
    const emphasizedIndex =
      line.length === 1 ? (lineIndex === 1 ? 0 : -1) : lastSignificantIndex === -1 ? line.length - 1 : lastSignificantIndex;
    return line.map((text, index) => ({ text, isEmphasized: index === emphasizedIndex }));
  });
}

export function getExcerpt(html: string, maxLength = 180) {
  // Paragraph breaks become spaces, inline tags vanish so no space lands before punctuation
  const text = html
    .replace(/<\/p>\s*<p[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

const TYPE_LABELS: Record<string, string> = {
  painting: "Peinture",
  fresco: "Fresque",
  triptych: "Triptyque",
  mural: "Peinture murale",
  "woodblock print": "Estampe sur bois",
};

export const getTypeLabel = (type: string | null) => (type ? (TYPE_LABELS[type] ?? type) : null);
