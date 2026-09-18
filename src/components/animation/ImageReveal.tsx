"use client";

import { type CSSProperties, type ReactNode, useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePageReady } from "@/stores/site-store";

type ImageRevealProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  innerClassName?: string;
  // "load" is for images above the fold, which must not wait for a scroll event
  trigger?: "scroll" | "load";
  delay?: number;
  reveal?: boolean;
  // Travel in percent of the frame. The image is scaled up to cover it, which crops its edges:
  // keep it for photographs and decors, never for a painting shown as a whole.
  parallax?: number;
};

export function ImageReveal({
  children,
  className,
  style,
  innerClassName,
  trigger = "scroll",
  delay = 0,
  reveal = true,
  parallax = 0,
}: ImageRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isPageReady = usePageReady();
  const hasStartedRef = useRef(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      const inner = innerRef.current;
      if (!isPageReady || hasStartedRef.current || !root || !inner) return;
      hasStartedRef.current = true;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const coverScale = 1 + (parallax * 2) / 100;

        if (parallax > 0) {
          gsap.set(inner, { scale: coverScale });
          gsap.fromTo(
            inner,
            { yPercent: -parallax },
            {
              yPercent: parallax,
              ease: "none",
              // clamp() keeps images already in view at load from starting mid-course
              scrollTrigger: { trigger: root, start: "clamp(top bottom)", end: "clamp(bottom top)", scrub: true },
            },
          );
        }

        if (reveal) {
          gsap
            .timeline({
              delay,
              // Starting before the frame is well inside the viewport shortens the wait as much as the duration does
              scrollTrigger: trigger === "scroll" ? { trigger: root, start: "top 95%", once: true } : undefined,
            })
            .fromTo(
              root,
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "reveal" },
            )
            // Outlasts the clip so the image is still settling once fully uncovered, which keeps the motion soft
            .from(inner, { scale: coverScale + 0.15, duration: 1.2, ease: "expo.out" }, 0);
        }
      });
    },
    { scope: rootRef, dependencies: [isPageReady] },
  );

  return (
    <div ref={rootRef} data-image-reveal={reveal ? "" : undefined} style={style} className={cn("overflow-hidden", className)}>
      <div ref={innerRef} className={innerClassName}>
        {children}
      </div>
    </div>
  );
}
