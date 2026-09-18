"use client";

import { useRef, useState } from "react";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { PaintingCoverImage } from "@/components/paintings/PaintingCoverImage";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import type { PaintingImage } from "@/lib/paintings";
import { useSiteStore } from "@/stores/site-store";

// Adapted from React Bits "Option Wheel": https://reactbits.dev/components/option-wheel
// Unlike the original, the wheel never captures the mouse wheel: the section is pinned and the page scroll
// drives the selection, so scrolling down the home page cannot get stuck on it.

export type ThemeWheelItem = {
  slug: string;
  label: string;
  description: string;
  href: string;
  cover: PaintingImage | null;
};

// Row height as a multiple of the label font size
const SPACING = 1.3;
// Angle between neighbors: the higher, the tighter the wheel curls
const TILT_DEG = 7;
const BLUR_PER_STEP = 1.5;
const FADE_PER_STEP = 0.24;
const MIN_OPACITY = 0.06;
const SMOOTHING_SECONDS = 0.18;
// Scroll distance spent on each theme, as a share of the viewport height
const SCROLL_PER_THEME = 0.5;

export function ThemeWheel({ themes }: { themes: ThemeWheelItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  // Filled once the scroll wiring exists; clicks and arrow keys go through it
  const goToRef = useRef<(index: number) => void>(() => {});
  const [selectedIndex, setSelectedIndex] = useState(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const count = themes.length;
      if (!section || count === 0) return;

      // Animation state lives here: it changes every frame and must never trigger a React render
      let position = 0;
      let target = 0;
      let selected = 0;
      let rowHeight = 0;
      let frameId = 0;
      let lastTime = 0;
      let isInstant = false;

      const measure = () => {
        const firstItem = itemRefs.current[0];
        rowHeight = firstItem ? parseFloat(getComputedStyle(firstItem).fontSize) * SPACING : 0;
      };

      const render = (time: number) => {
        const delta = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;
        position = isInstant ? target : position + (target - position) * (1 - Math.exp(-delta / SMOOTHING_SECONDS));
        const isSettled = Math.abs(target - position) < 0.001;
        if (isSettled) position = target;

        // Labels sit on a circle whose radius keeps one row height between neighbors along the arc
        const tilt = (TILT_DEG * Math.PI) / 180;
        const radius = rowHeight / tilt;
        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const offset = index - position;
          const distance = Math.abs(offset);
          const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, offset * tilt));
          const x = -radius * (1 - Math.cos(angle));
          const y = radius * Math.sin(angle);
          item.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${((angle * 180) / Math.PI).toFixed(3)}deg)`;
          item.style.opacity = Math.max(MIN_OPACITY, 1 - distance * FADE_PER_STEP).toFixed(3);
          item.style.filter = distance > 0.01 ? `blur(${(distance * BLUR_PER_STEP).toFixed(2)}px)` : "none";
          item.style.setProperty("--wheel-focus", Math.max(0, 1 - Math.min(distance, 1)).toFixed(3));
        });

        frameId = isSettled ? 0 : requestAnimationFrame(render);
      };

      const startLoop = () => {
        if (frameId) return;
        lastTime = performance.now();
        frameId = requestAnimationFrame(render);
      };

      const setTarget = (value: number) => {
        target = Math.min(Math.max(value, 0), count - 1);
        const index = Math.round(target);
        if (index !== selected) {
          selected = index;
          setSelectedIndex(index);
        }
        startLoop();
      };

      measure();
      setTarget(0);
      const resizeObserver = new ResizeObserver(() => {
        measure();
        // Forces a frame even when settled, since row positions depend on the measured font size
        cancelAnimationFrame(frameId);
        frameId = 0;
        startLoop();
      });
      resizeObserver.observe(section);

      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (context) => {
          if (context.conditions?.reduced || count < 2) {
            isInstant = true;
            goToRef.current = (index) => setTarget(index);
            return;
          }
          isInstant = false;

          const trigger = ScrollTrigger.create({
            trigger: section,
            // Pinned right below the sticky header rather than behind it
            start: () => `top ${document.querySelector("header")?.offsetHeight ?? 0}px`,
            end: () => `+=${(count - 1) * window.innerHeight * SCROLL_PER_THEME}`,
            pin: true,
            // The pin spacer changes the page height: it must be measured before the triggers further down
            refreshPriority: 1,
            onUpdate: (self) => setTarget(self.progress * (count - 1)),
          });

          goToRef.current = (index) => {
            const top = trigger.start + ((trigger.end - trigger.start) * index) / (count - 1);
            const { lenis } = useSiteStore.getState();
            if (lenis) lenis.scrollTo(top, { duration: 1.1 });
            else window.scrollTo({ top, behavior: "smooth" });
          };
        },
      );

      return () => {
        cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
      };
    },
    { scope: sectionRef, dependencies: [themes.length] },
  );

  if (themes.length === 0) return null;
  const selectedTheme = themes[selectedIndex];

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden bg-paper">
      <div className="wrapper grid h-[calc(100svh-var(--spacing-header))] grid-rows-[auto_minmax(0,1fr)_auto] gap-6 py-8 md:grid-cols-12 md:grid-rows-[auto_minmax(0,1fr)] md:gap-x-10 md:py-12">
        <div className="flex flex-wrap items-baseline-last justify-between gap-x-8 gap-y-3 md:col-span-12">
          <div>
            <h2 className="eyebrow text-accent">Explorer par thème</h2>
          </div>
          <TransitionLink href="/tableaux" className="link-underline link-cta">
            Voir tous les tableaux
            <ArrowRightIcon className="size-4" />
          </TransitionLink>
        </div>

        <ul
          role="listbox"
          tabIndex={0}
          aria-label="Thèmes"
          aria-activedescendant={`theme-option-${selectedTheme.slug}`}
          onKeyDown={(event) => {
            const moves: Record<string, number> = {
              ArrowUp: selectedIndex - 1,
              ArrowLeft: selectedIndex - 1,
              ArrowDown: selectedIndex + 1,
              ArrowRight: selectedIndex + 1,
              Home: 0,
              End: themes.length - 1,
            };
            if (!(event.key in moves)) return;
            event.preventDefault();
            goToRef.current(Math.min(Math.max(moves[event.key], 0), themes.length - 1));
          }}
          // The mask fades the far options into the page instead of cutting them at the box edge
          className="relative min-h-0 overflow-hidden outline-offset-4 select-none mask-[linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)] md:col-span-7"
        >
          {themes.map((theme, index) => (
            <li
              key={theme.slug}
              id={`theme-option-${theme.slug}`}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => goToRef.current(index)}
              // Weight and color follow how centered the label is, so it thickens smoothly as it reaches the middle
              style={{
                fontWeight: "calc(200 + var(--wheel-focus, 0) * 400)",
                color: "color-mix(in srgb, var(--color-ink) calc(var(--wheel-focus, 0) * 100%), var(--color-ink-muted))",
              }}
              className="type-display absolute top-1/2 left-8 origin-left cursor-pointer text-h1 whitespace-nowrap opacity-0 will-change-[transform,opacity,filter] md:left-20"
            >
              {theme.label}
            </li>
          ))}
        </ul>

        {/* Cover, text and button share one centered axis, level with the wheel's selected label */}
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] md:col-span-5 md:content-center">
          {themes.map((theme, index) => {
            const isActive = index === selectedIndex;
            return (
              <div
                key={theme.slug}
                // inert keeps the hidden panels' links out of the tab order and away from assistive tech
                inert={!isActive}
                className={cn(
                  "flex flex-col items-center text-center [grid-area:1/1] transition-[opacity,translate] duration-700 ease-museum",
                  isActive ? "opacity-100" : "pointer-events-none translate-y-6 opacity-0",
                )}
              >
                {/* Height is what the pinned section leaves once the header row, text and button are placed */}
                {theme.cover && (
                  <div
                    aria-hidden
                    className="relative hidden aspect-4/5 h-56 max-w-full overflow-hidden bg-paper-deep shadow-[0_24px_60px_-20px_rgb(26_23_20/0.4)] sm:block md:h-[clamp(10rem,100svh-28rem,30rem)]"
                  >
                    <PaintingCoverImage image={theme.cover} sizes="(min-width: 768px) 400px, 240px" />
                  </div>
                )}
                <p className="mt-6 max-w-md text-lead text-ink-muted md:mt-10">{theme.description}</p>
                <TransitionLink href={theme.href} className={buttonClasses({ className: "mt-6 md:mt-8" })}>
                  Voir les œuvres
                  <ArrowRightIcon className="size-4" />
                </TransitionLink>
              </div>
            );
          })}
          <p aria-live="polite" className="sr-only">
            {selectedTheme.label}
          </p>
        </div>
      </div>
    </section>
  );
}
