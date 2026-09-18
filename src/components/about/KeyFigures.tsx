"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export type KeyFigure = {
  value: number;
  // Digits after the comma, so 1.5 reads "1,5" and 17 stays "17"
  decimals?: number;
  unit?: string;
  label: string;
};

type KeyFiguresProps = {
  figures: KeyFigure[];
};

const COUNT_DURATION = 2;

// Grouping off: a year must stay "1870", never "1 870"
const format = (value: number, decimals = 0) =>
  value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false,
  });

export function KeyFigures({ figures }: KeyFiguresProps) {
  const listRef = useRef<HTMLDListElement>(null);

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-figure]", list);

        items.forEach((item, index) => {
          const number = item.querySelector<HTMLElement>("[data-figure-target]");
          const target = Number(number?.dataset.figureTarget);
          const decimals = Number(number?.dataset.figureDecimals ?? 0);

          const timeline = gsap.timeline({
            // Each figure starts as the row reaches the same point, so the stagger comes from the delay alone
            scrollTrigger: { trigger: list, start: "top 80%", once: true },
            delay: index * 0.12,
          });

          timeline.from(item, { yPercent: 40, autoAlpha: 0, duration: 1, ease: "expo.out" });

          if (number && Number.isFinite(target)) {
            const counter = { current: 0 };
            timeline.to(
              counter,
              {
                current: target,
                duration: COUNT_DURATION,
                ease: "power2.out",
                onUpdate: () => {
                  number.textContent = format(counter.current, decimals);
                },
                // The rounded frames of the animation never land exactly on the target
                onComplete: () => {
                  number.textContent = format(target, decimals);
                },
              },
              0,
            );
          }
        });
      });
    },
    { scope: listRef },
  );

  return (
    <dl ref={listRef} className="grid grid-cols-2 gap-px bg-paper/15 lg:grid-cols-4">
      {figures.map((figure, index) => (
        <div
          key={figure.label}
          data-figure
          // The gap is the hairline: each cell paints over it, leaving a one pixel rule between them
          className="flex flex-col gap-8 bg-ink px-6 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-14"
        >
          <span aria-hidden className="eyebrow text-paper/40">
            {String(index + 1).padStart(2, "0")}
          </span>
          {/* Reversed so the figure is read before its label, while the label stays first in the source order
              that a screen reader follows for a definition list */}
          <div className="flex flex-col-reverse gap-2">
            <dt className="text-small text-paper/60">{figure.label}</dt>
            <dd className="type-numeral flex items-baseline gap-1.5 text-display leading-none font-extralight">
              <span data-figure-target={figure.value} data-figure-decimals={figure.decimals}>
                {format(figure.value, figure.decimals)}
              </span>
              {figure.unit ? <span className="text-h3 text-accent">{figure.unit}</span> : null}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
