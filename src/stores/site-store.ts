import type Lenis from "lenis";
import { create } from "zustand";

type TransitionPhase = "idle" | "leaving" | "entering";

type SiteState = {
  // True until the preloader has played. The root layout stays mounted across client navigations,
  // so the preloader only shows on a full page load.
  isFirstRender: boolean;
  transitionPhase: TransitionPhase;
  pendingHref: string | null;
  // Kept after the navigation so the curtain text does not change while it slides away
  transitionLabel: string | null;
  lenis: Lenis | null;
  finishFirstRender: () => void;
  navigate: (href: string, label: string) => void;
  startEntering: () => void;
  finishTransition: () => void;
  setLenis: (lenis: Lenis | null) => void;
};

// A module-level store is safe despite SSR: it only holds browser UI state and is never written during a server render
export const useSiteStore = create<SiteState>()((set, get) => ({
  isFirstRender: true,
  transitionPhase: "idle",
  pendingHref: null,
  transitionLabel: null,
  lenis: null,
  finishFirstRender: () => set({ isFirstRender: false }),
  navigate: (href, label) => {
    if (get().transitionPhase === "idle") set({ transitionPhase: "leaving", pendingHref: href, transitionLabel: label });
  },
  startEntering: () => set({ transitionPhase: "entering", pendingHref: null }),
  finishTransition: () => set({ transitionPhase: "idle" }),
  setLenis: (lenis) => set({ lenis }),
}));

// Entrance animations wait for this, so nothing plays hidden behind the preloader or the page curtain
export const usePageReady = () =>
  useSiteStore((state) => !state.isFirstRender && state.transitionPhase !== "leaving");
