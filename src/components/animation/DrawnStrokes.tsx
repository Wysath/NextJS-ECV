"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePageReady } from "@/stores/site-store";

type Placement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

type DrawnStrokesProps = {
  placements?: Placement[];
  // "dark" for strokes over ink or photographs
  tone?: "light" | "dark";
  size?: "md" | "lg";
  // "load" for sections visible on arrival, "scroll" draws each stroke as it enters the viewport
  trigger?: "load" | "scroll";
  className?: string;
};

const HOOK_PATH =
  "M250 -20C170 70 140 170 205 240C255 295 330 255 300 180C275 120 190 150 175 230C160 310 210 390 150 440";
const LOOP_PATH =
  "M-20 430C60 300 190 250 245 335C295 415 215 505 130 460C45 415 115 285 265 270C350 262 410 300 440 360";

const SHAPES = {
  "top-right": { kind: "hook", position: "-top-8 -right-6" },
  "top-left": { kind: "hook", position: "-top-8 -left-6 -scale-x-100" },
  "bottom-left": { kind: "loop", position: "-bottom-20 -left-16" },
  "bottom-right": { kind: "loop", position: "-bottom-20 -right-16 -scale-x-100" },
} as const;

const PATHS = {
  hook: { d: HOOK_PATH, viewBox: "0 0 300 420" },
  loop: { d: LOOP_PATH, viewBox: "0 0 420 480" },
};

const WIDTHS = {
  md: { hook: "w-40 md:w-56", loop: "w-72 md:w-96" },
  lg: { hook: "w-56 md:w-80", loop: "w-80 md:w-[34rem]" },
};

// Decorative arabesques drawn like a brush stroke: the graphic signature shared across sections.
// The parent needs `relative isolate` (and a clip) so the strokes sit above its background but below its content.
export function DrawnStrokes({
  placements = ["top-right", "bottom-left"],
  tone = "light",
  size = "md",
  trigger = "load",
  className,
}: DrawnStrokesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isPageReady = usePageReady();
  const hasStartedRef = useRef(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!isPageReady || hasStartedRef.current || !root) return;
      hasStartedRef.current = true;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        root.querySelectorAll<SVGSVGElement>("[data-stroke]").forEach((svg, index) => {
          gsap
            .timeline({
              delay: trigger === "load" ? 0.3 + index * 0.3 : 0,
              scrollTrigger: trigger === "scroll" ? { trigger: svg, start: "top 90%", once: true } : undefined,
            })
            .set(svg, { opacity: 1 })
            .fromTo(svg.querySelector("path"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 2.6, ease: "museum" });
        });
      });
    },
    { scope: rootRef, dependencies: [isPageReady] },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        tone === "dark" ? "text-paper/15" : "text-line/70",
        className,
      )}
    >
      {placements.map((placement) => {
        const { kind, position } = SHAPES[placement];
        return (
          // Hidden until drawn, otherwise the full stroke flashes before the animation resets it
          <svg
            key={placement}
            data-stroke
            viewBox={PATHS[kind].viewBox}
            fill="none"
            className={cn("absolute opacity-0 motion-reduce:opacity-100", position, WIDTHS[size][kind])}
          >
            <path d={PATHS[kind].d} stroke="currentColor" strokeWidth={18} strokeLinecap="round" />
          </svg>
        );
      })}
    </div>
  );
}
