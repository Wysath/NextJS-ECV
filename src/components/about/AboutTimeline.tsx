"use client";

import { useRef } from "react";
import type { Milestone } from "@/data/about";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

// Stacked panels: each date is a full screen that slides over the previous one, the light and dark grounds
// alternating so the cover is unmistakable. The stacking itself is sticky positioning, not script.
export function AboutTimeline({ milestones }: { milestones: Milestone[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const total = String(milestones.length).padStart(2, "0");

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-panel]", list).forEach((panel) => {
          // No scroll-linked tween on the panels themselves: they are sticky, and ScrollTrigger would measure
          // positions that the stacking keeps moving
          gsap.from(panel.querySelectorAll("[data-panel-line]"), {
            yPercent: 110,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.08,
            scrollTrigger: { trigger: panel, start: "top 70%", once: true },
          });
        });
      });
    },
    { scope: listRef, dependencies: [milestones.length] },
  );

  return (
    <ol ref={listRef}>
      {milestones.map((milestone, index) => {
        const isDark = index % 2 === 1;
        return (
          // As tall as the panel: the panel stays put while the next one slides up over it
          <li
            key={milestone.year}
            data-panel
            className={cn(
              "sticky top-header h-[calc(100svh-var(--spacing-header))] min-h-140 border-t py-10 md:py-16",
              isDark ? "border-paper/20 bg-ink text-paper" : "border-ink/15 bg-paper text-ink",
            )}
          >
            {/* Content in the upper half: the panel is covered from the bottom, so what is read must sit out of reach
                of the next panel for as long as possible */}
            <div data-panel-content className="wrapper flex h-full flex-col gap-10 md:gap-14">
              <div className={cn("eyebrow flex justify-between", isDark ? "text-paper/50" : "text-ink-muted")}>
                <span>
                  {String(index + 1).padStart(2, "0")} / {total}
                </span>
                <span>Chronologie</span>
              </div>

              <div className="flex flex-col gap-6 md:gap-8">
                {/* Overflow hidden on the line wrappers: the reveal slides each line out from behind its own edge */}
                <p className="overflow-hidden py-[0.06em]">
                  <span data-panel-line className="type-display block text-hero leading-none font-extralight">
                    {milestone.year}
                  </span>
                </p>

                <div className="grid gap-4 md:grid-cols-12 md:gap-10">
                  <div className="overflow-hidden py-[0.06em] md:col-span-5">
                    <h3 data-panel-line className="block text-h2">
                      {milestone.title}
                    </h3>
                  </div>
                  <p
                    data-panel-line
                    className={cn(
                      "max-w-prose text-lead md:col-span-6 md:col-start-7",
                      isDark ? "text-paper/70" : "text-ink-muted",
                    )}
                  >
                    {milestone.text}
                  </p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
