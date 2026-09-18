"use client";

import { type ReactNode, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSiteStore } from "@/stores/site-store";

const COUNT_DURATION = 1.8;

const Mask = ({ children }: { children: ReactNode }) => <div className="overflow-hidden">{children}</div>;

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  // Starts done when the store says it already played, e.g. after a Fast Refresh remount
  const [isDone, setIsDone] = useState(() => !useSiteStore.getState().isFirstRender);

  useGSAP(
    () => {
      const root = rootRef.current;
      const counter = counterRef.current;
      if (!root || !counter) return;

      const { finishFirstRender } = useSiteStore.getState();
      const html = document.documentElement;
      html.style.overflow = "hidden";
      const finish = () => {
        html.style.overflow = "";
        setIsDone(true);
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to(root, { autoAlpha: 0, duration: 0.4, delay: 0.2, onStart: finishFirstRender, onComplete: finish });
        return;
      }

      const progress = { value: 0 };
      const timeline = gsap.timeline({ onComplete: finish });
      timeline
        .from("[data-preloader-line]", { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.06 })
        .to(
          progress,
          {
            value: 100,
            duration: COUNT_DURATION,
            ease: "power2.inOut",
            onUpdate: () => {
              counter.textContent = String(Math.round(progress.value)).padStart(3, "0");
            },
          },
          0.2,
        )
        .fromTo("[data-preloader-bar]", { scaleX: 0 }, { scaleX: 1, duration: COUNT_DURATION, ease: "power2.inOut" }, "<")
        // Holds the exit until the web fonts are in, so the page never reveals in a fallback typeface
        .addPause(">", () => {
          document.fonts.ready.then(() => timeline.resume());
        })
        .to("[data-preloader-line]", { yPercent: -110, duration: 0.7, ease: "expo.in", stagger: 0.04 })
        .to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "museum" }, "-=0.15")
        // The page starts its own entrance while the panel is still lifting
        .call(finishFirstRender, undefined, "<0.25");
    },
    { scope: rootRef },
  );

  if (isDone) return null;

  return (
    <div
      ref={rootRef}
      data-preloader
      aria-hidden
      className="fixed inset-0 z-200 flex flex-col justify-between bg-ink px-gutter py-6 text-paper md:py-10"
    >
      <div className="flex justify-between gap-6 text-small text-paper/60">
        <Mask>
          <span data-preloader-line className="block">
            {siteConfig.fullName}
          </span>
        </Mask>
        <Mask>
          <span data-preloader-line className="block">
            New York
          </span>
        </Mask>
      </div>

      <div>
        <div className="flex items-end justify-between gap-6">
          <Mask>
            <p data-preloader-line className="wordmark text-hero">
              {siteConfig.name}
            </p>
          </Mask>
          <Mask>
            <p data-preloader-line className="pb-[0.12em] type-numeral text-h1">
              <span ref={counterRef}>000</span>
            </p>
          </Mask>
        </div>
        <div className="mt-6 h-px bg-paper/20 md:mt-10">
          {/* Inline transform rather than a Tailwind scale class: GSAP writes transform, Tailwind writes the separate scale property */}
          <div data-preloader-bar className="h-full origin-left bg-paper" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
