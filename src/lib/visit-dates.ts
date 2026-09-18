// The museum books days on its own calendar, whatever the server or visitor time zone
const MUSEUM_TIME_ZONE = "America/New_York";
// Wednesday, as in the opening hours of siteConfig
const CLOSED_WEEKDAY = 3;
// Far enough ahead to plan any trip, bounded so that a mistyped year is still refused
const BOOKING_WINDOW_YEARS = 1;
// A plausibility bound against typos (1098 for 1998), not an age policy
const MAX_AGE_YEARS = 120;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Written out rather than formatted with Intl: the calendar formats dates in the browser for any month, and
// server and browser ICU data can disagree, which would change a label between render and hydration
const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

// Inclusive ISO bounds; ISO dates compare correctly as strings
export type DateRange = { min: string; max: string };
export type BirthDateBounds = DateRange;

export type CalendarMonth = { year: number; month: number };
export type CalendarDay = { value: string; day: number };

// Calendar days are handled as UTC midnights so that day arithmetic never crosses a DST change
const toUtcDate = (value: string) => new Date(`${value}T00:00:00Z`);
const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);
const shiftYears = (value: string, years: number) => `${Number(value.slice(0, 4)) + years}${value.slice(4)}`;
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const formatDay = (day: number) => (day === 1 ? "1er" : String(day));

// Rejects well-formed but impossible days such as 2001-02-30, which Date would silently roll over
export const isCalendarDate = (value: unknown): value is string =>
  typeof value === "string" &&
  DATE_PATTERN.test(value) &&
  !Number.isNaN(toUtcDate(value).getTime()) &&
  toIsoDate(toUtcDate(value)) === value;

export function formatVisitDate(value: string) {
  const date = toUtcDate(value);
  return `${capitalize(WEEKDAYS[date.getUTCDay()])} ${formatDay(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatBirthDate(value: string) {
  const date = toUtcDate(value);
  return `${formatDay(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export const formatMonth = ({ year, month }: CalendarMonth) => `${capitalize(MONTHS[month])} ${year}`;

export const toCalendarMonth = (value: string): CalendarMonth => ({
  year: Number(value.slice(0, 4)),
  month: Number(value.slice(5, 7)) - 1,
});

export const addMonths = ({ year, month }: CalendarMonth, count: number): CalendarMonth => ({
  year: year + Math.floor((month + count) / 12),
  month: (((month + count) % 12) + 12) % 12,
});

export const compareMonths = (a: CalendarMonth, b: CalendarMonth) => a.year * 12 + a.month - (b.year * 12 + b.month);

// Monday-first weeks: the number of blank cells before the 1st, then every day of the month
export function getMonthGrid({ year, month }: CalendarMonth): { offset: number; days: CalendarDay[] } {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return {
    offset,
    days: Array.from({ length: dayCount }, (_, index) => ({
      value: toIsoDate(new Date(Date.UTC(year, month, index + 1))),
      day: index + 1,
    })),
  };
}

export const isClosedDay = (value: string) => toUtcDate(value).getUTCDay() === CLOSED_WEEKDAY;

export const isInRange = (value: string, { min, max }: DateRange) => value >= min && value <= max;

export const isBookableDate = (value: string, range: DateRange) =>
  isCalendarDate(value) && isInRange(value, range) && !isClosedDay(value);

function getMuseumToday(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MUSEUM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

// Both ranges are computed on the server and passed to the form, so the calendar, the date picker and the
// validation all share the same "today"
export function getBookingRange(now: Date): DateRange {
  const today = getMuseumToday(now);
  return { min: today, max: shiftYears(today, BOOKING_WINDOW_YEARS) };
}

export function getBirthDateBounds(now: Date): BirthDateBounds {
  const today = getMuseumToday(now);
  return { min: shiftYears(today, -MAX_AGE_YEARS), max: today };
}

export const isBirthDateInBounds = (value: string, bounds: BirthDateBounds) =>
  isCalendarDate(value) && isInRange(value, bounds);
