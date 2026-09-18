"use client";

import { type ReactNode, useState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  type CalendarMonth,
  type DateRange,
  addMonths,
  compareMonths,
  formatMonth,
  formatVisitDate,
  getMonthGrid,
  isBookableDate,
  toCalendarMonth,
} from "@/lib/visit-dates";

const WEEKDAY_HEADERS = [
  { short: "lun", long: "lundi" },
  { short: "mar", long: "mardi" },
  { short: "mer", long: "mercredi" },
  { short: "jeu", long: "jeudi" },
  { short: "ven", long: "vendredi" },
  { short: "sam", long: "samedi" },
  { short: "dim", long: "dimanche" },
];

type VisitCalendarProps = {
  value: string;
  onChange: (value: string) => void;
  range: DateRange;
  describedBy?: string;
};

export function VisitCalendar({ value, onChange, range, describedBy }: VisitCalendarProps) {
  const firstMonth = toCalendarMonth(range.min);
  const lastMonth = toCalendarMonth(range.max);
  const [shownMonth, setShownMonth] = useState<CalendarMonth>(value ? toCalendarMonth(value) : firstMonth);
  // Two months side by side from md: the second one is skipped once it would fall past the booking window
  const months = [shownMonth, addMonths(shownMonth, 1)].filter((month) => compareMonths(month, lastMonth) <= 0);

  const isSelectionShown = months.some((month) => value && compareMonths(month, toCalendarMonth(value)) === 0);
  const canGoBack = compareMonths(shownMonth, firstMonth) > 0;
  const canGoForward = compareMonths(shownMonth, lastMonth) < 0;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p aria-live="polite" className="type-label">
          {formatMonth(shownMonth)}
          {months[1] && <span className="hidden md:inline"> et {formatMonth(months[1]).toLowerCase()}</span>}
        </p>
        <div className="flex gap-2">
          <MonthButton label="Mois précédent" disabled={!canGoBack} onClick={() => setShownMonth(addMonths(shownMonth, -1))}>
            <ArrowRightIcon className="size-4 rotate-180" />
          </MonthButton>
          <MonthButton label="Mois suivant" disabled={!canGoForward} onClick={() => setShownMonth(addMonths(shownMonth, 1))}>
            <ArrowRightIcon className="size-4" />
          </MonthButton>
        </div>
      </div>

      {/* The radios of a month scrolled out of view leave the DOM: this keeps the chosen date in the submitted form */}
      {value && !isSelectionShown && <input type="hidden" name="date" value={value} />}

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        {months.map((month, index) => {
          const { offset, days } = getMonthGrid(month);
          return (
            <div
              key={`${month.year}-${month.month}`}
              role="group"
              aria-label={formatMonth(month)}
              className={cn(index === 1 && "hidden md:block")}
            >
              {index === 1 && <p className="mb-3 text-small text-ink-muted md:hidden">{formatMonth(month)}</p>}
              <div aria-hidden className="grid grid-cols-7 text-center text-small text-ink-muted">
                {WEEKDAY_HEADERS.map((weekday) => (
                  <abbr key={weekday.short} title={weekday.long} className="pb-2 no-underline">
                    {weekday.short}
                  </abbr>
                ))}
              </div>
              <ul className="grid grid-cols-7 gap-1">
                {offset > 0 && <li aria-hidden style={{ gridColumn: `span ${offset}` }} />}
                {days.map((day) => {
                  const isBookable = isBookableDate(day.value, range);
                  const isToday = day.value === range.min;
                  return (
                    <li key={day.value}>
                      {isBookable ? (
                        // relative: keeps the sr-only radio positioned inside its cell
                        <label
                          className={cn(
                            "relative flex aspect-square cursor-pointer items-center justify-center border border-transparent tabular-nums transition-colors hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
                            isToday && "underline decoration-accent underline-offset-4",
                          )}
                        >
                          <input
                            type="radio"
                            name="date"
                            value={day.value}
                            checked={value === day.value}
                            onChange={() => onChange(day.value)}
                            aria-label={`${formatVisitDate(day.value)}${isToday ? ", aujourd’hui" : ""}`}
                            aria-describedby={describedBy}
                            className="sr-only"
                          />
                          <span aria-hidden>{day.day}</span>
                        </label>
                      ) : (
                        // Closed or out of the booking window: shown for orientation only
                        <span aria-hidden className="flex aspect-square items-center justify-center text-ink-muted/40 tabular-nums">
                          {day.day}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type MonthButtonProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
};

function MonthButton({ label, disabled, onClick, children }: MonthButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full border transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
