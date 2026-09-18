"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { siteConfig } from "@/config/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSiteStore } from "@/stores/site-store";

// Lifts the curtain anyway if the new page never commits (network error, cancelled navigation)
const FALLBACK_REVEAL_MS = 10_000;
// Prefetched pages usually commit within this delay, so the loader only shows up for slower ones
const LOADER_DELAY = 0.4;
// A navigation reports no progress: the bar eases towards this cap and only reaches 100 once the page commits
const LOADER_CAP = 90;
const LOADER_TRICKLE_DURATION = 8;

type CurtainState = {
  progress: { value: number };
  trickle: gsap.core.Timeline | null;
  isRevealing: boolean;
};

const getParts = (root: HTMLElement) => ({
  panels: root.querySelectorAll("[data-curtain-panel]"),
  label: root.querySelector("[data-curtain-label]"),
  loader: root.querySelectorAll("[data-curtain-loader]"),
  counter: root.querySelector("[data-curtain-counter]"),
  bar: root.querySelector("[data-curtain-bar]"),
});

function renderProgress(root: HTMLElement, state: CurtainState) {
  const { counter, bar } = getParts(root);
  if (counter) counter.textContent = String(Math.round(state.progress.value)).padStart(3, "0");
  gsap.set(bar, { scaleX: state.progress.value / 100 });
}

function coverPage(root: HTMLElement, onCovered: () => void) {
  const { panels, label } = getParts(root);
  gsap
    .timeline()
    .set(root, { visibility: "visible" })
    .set(label, { yPercent: 110 })
    // The request leaves as soon as the screen is covered: waiting for the wordmark would add its own duration
    .to(panels, { yPercent: 0, duration: 0.55, ease: "museum", stagger: 0.05, onComplete: onCovered })
    .to(label, { yPercent: 0, duration: 0.5, ease: "expo.out" }, "-=0.3");
}

function startLoading(root: HTMLElement, state: CurtainState) {
  const { loader } = getParts(root);
  state.progress.value = 0;
  renderProgress(root, state);
  state.trickle = gsap
    .timeline({ delay: LOADER_DELAY })
    .to(loader, { autoAlpha: 1, duration: 0.3 })
    .to(
      state.progress,
      {
        value: LOADER_CAP,
        duration: LOADER_TRICKLE_DURATION,
        ease: "power4.out",
        onUpdate: () => renderProgress(root, state),
      },
      0,
    );
}

function revealPage(root: HTMLElement, state: CurtainState) {
  // A back navigation during the reveal would otherwise start a second one
  if (state.isRevealing) return;
  state.isRevealing = true;

  const { panels, label, loader } = getParts(root);
  const { lenis, startEntering, finishTransition } = useSiteStore.getState();
  // Next.js scrolls the window to the top, but Lenis keeps its own position and would glide back to the old one
  lenis?.scrollTo(0, { immediate: true, force: true });

  // Still at opacity 0 when the page committed within LOADER_DELAY: nothing to complete then
  const isLoaderShown = loader.length > 0 && Number(gsap.getProperty(loader[0], "opacity")) > 0;
  state.trickle?.kill();
  state.trickle = null;

  const timeline = gsap.timeline({
    onComplete: () => {
      gsap.set(root, { visibility: "hidden" });
      gsap.set(panels, { yPercent: 100 });
      state.isRevealing = false;
      finishTransition();
    },
  });

  if (isLoaderShown) {
    timeline
      .to(state.progress, {
        value: 100,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: () => renderProgress(root, state),
      })
      // Fades while the counter is still finishing, rather than after it
      .to(loader, { autoAlpha: 0, duration: 0.2 }, "-=0.1");
  } else {
    timeline.set(loader, { autoAlpha: 0 });
  }

  timeline
    .to(label, { yPercent: -110, duration: 0.35, ease: "expo.in" }, isLoaderShown ? "-=0.15" : 0)
    .to(panels, { yPercent: -100, duration: 0.6, ease: "museum", stagger: { each: 0.05, from: "end" } }, "-=0.1")
    // The new page starts its entrance as the panels begin to lift, not while it is still covered
    .call(startEntering, undefined, "<");
}

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const pendingHref = useSiteStore((state) => state.pendingHref);
  const transitionLabel = useSiteStore((state) => state.transitionLabel);
  const rootRef = useRef<HTMLDivElement>(null);
  const previousPathnameRef = useRef(pathname);
  const fallbackTimeoutRef = useRef(0);
  const curtainStateRef = useRef<CurtainState>({ progress: { value: 0 }, trickle: null, isRevealing: false });

  useGSAP(
    () => {
      gsap.set("[data-curtain-panel]", { yPercent: 100 });
      gsap.set("[data-curtain-loader]", { autoAlpha: 0 });
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      const curtainState = curtainStateRef.current;
      if (!root) return;
      const isLeaving = useSiteStore.getState().transitionPhase === "leaving";

      // The new pathname commits together with the new page, so the curtain lifts as soon as it changes
      if (pathname !== previousPathnameRef.current) {
        previousPathnameRef.current = pathname;
        if (isLeaving) {
          window.clearTimeout(fallbackTimeoutRef.current);
          revealPage(root, curtainState);
        }
        return;
      }

      if (!pendingHref || !isLeaving) return;
      coverPage(root, () => {
        // The visitor may have used the back button meanwhile, which already revealed another page
        if (useSiteStore.getState().transitionPhase !== "leaving") return;
        router.push(pendingHref);
        startLoading(root, curtainState);
        fallbackTimeoutRef.current = window.setTimeout(() => revealPage(root, curtainState), FALLBACK_REVEAL_MS);
      });
    },
    { dependencies: [pathname, pendingHref] },
  );

  return (
    <div ref={rootRef} aria-hidden className="invisible fixed inset-0 z-150">
      <div data-curtain-panel className="absolute inset-0 bg-accent" />
      <div
        data-curtain-panel
        className="absolute inset-0 flex flex-col justify-end bg-ink px-gutter py-6 text-paper md:py-10"
      >
        <div className="flex items-end justify-between gap-6">
          {/* Bottom padding keeps descenders inside the mask, which the Latin-only wordmark never needed */}
          <div className="min-w-0 overflow-hidden pb-[0.12em] text-display">
            <p data-curtain-label className="max-w-[16ch] wordmark text-display text-balance">
              {transitionLabel ?? siteConfig.name}
            </p>
          </div>
          <p data-curtain-loader className="invisible pb-[0.12em] type-numeral text-h2">
            <span data-curtain-counter>000</span>
          </p>
        </div>
        <div data-curtain-loader className="invisible mt-6 h-px bg-paper/20 md:mt-10">
          {/* Inline transform rather than a Tailwind scale class: GSAP writes transform, Tailwind writes the separate scale property */}
          <div data-curtain-bar className="h-full origin-left bg-paper" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
