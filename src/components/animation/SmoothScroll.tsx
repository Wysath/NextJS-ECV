"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { ScrollTrigger, gsap } from "@/lib/gsap";
import { useSiteStore } from "@/stores/site-store";

// Anchor targets land below the sticky header
const ANCHOR_OFFSET = -96;
const REFRESH_DELAY_MS = 150;

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      // Pauses itself whenever <html> gets overflow: hidden (mobile menu, preloader)
      autoToggle: true,
      anchors: { offset: ANCHOR_OFFSET },
      stopInertiaOnNavigate: true,
    });

    // Driven by GSAP's ticker so ScrollTrigger reads the smoothed position on the same frame
    const onTick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    useSiteStore.getState().setLenis(lenis);

    // ScrollTrigger only refreshes on window resize, yet filtering paintings or changing page moves every trigger
    let refreshTimeout = 0;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(() => ScrollTrigger.refresh(), REFRESH_DELAY_MS);
    });
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(refreshTimeout);
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      useSiteStore.getState().setLenis(null);
    };
  }, []);

  return null;
}
