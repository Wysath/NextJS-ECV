"use client";

import { useRef, type ReactNode } from "react";
import { SplitText, gsap, useGSAP } from "@/lib/gsap";
import { usePageReady } from "@/stores/site-store";

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  // "load" is for above-the-fold text, which must not wait for a scroll event
  trigger?: "scroll" | "load";
};

// Wrapper so server components keep their semantic tags: every direct child gets split into masked lines.
// Children must be static: SplitText moves their DOM nodes, so a React update inside would fail to reconcile.
export function TextReveal({ children, className, delay = 0, trigger = "scroll" }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPageReady = usePageReady();
  // The footer lives in the layout and sees every navigation: its text must be split only once
  const hasStartedRef = useRef(false);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!isPageReady || hasStartedRef.current || !container) return;
      hasStartedRef.current = true;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(container.children, {
          type: "lines",
          mask: "lines",
          // Re-splits when fonts load or the width changes, keeping the returned animation in sync
          autoSplit: true,
          onSplit(self) {
            // Tight line-heights would clip accents and descenders inside the masks
            gsap.set(self.masks, {
              paddingTop: "0.12em",
              paddingBottom: "0.12em",
              marginTop: "-0.12em",
              marginBottom: "-0.12em",
            });
            gsap.set(container, { visibility: "visible" });

            return gsap.from(self.lines, {
              yPercent: 120,
              duration: 1.2,
              ease: "expo.out",
              stagger: 0.08,
              delay,
              scrollTrigger:
                trigger === "scroll" ? { trigger: container, start: "top 90%", once: true } : undefined,
            });
          },
        });
      });

      // Runs when the context reverts, which only happens on unmount: StrictMode's rehearsal unmount undoes the split,
      // so the remount must be allowed to split again or the text would stay hidden
      return () => {
        hasStartedRef.current = false;
      };
    },
    { scope: containerRef, dependencies: [isPageReady] },
  );

  return (
    <div ref={containerRef} data-text-reveal className={className}>
      {children}
    </div>
  );
}
