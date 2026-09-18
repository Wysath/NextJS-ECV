"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { WikimediaImage } from "@/components/paintings/WikimediaImage";
import type { Painting } from "@/lib/paintings";
import { cn } from "@/lib/cn";
import { isWikimediaUrl } from "@/lib/wikimedia";

// Adapted from React Bits "Infinite Spiral": https://reactbits.dev/components/infinite-spiral

type PaintingSpiralProps = {
  paintings: Painting[];
  className?: string;
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  verticalSpacing?: number;
  cardsPerTurn?: number;
  speed?: number;
  centerScale?: number;
  edgeFade?: number;
  edgeBlur?: number;
  perspective?: number;
  // How far (px) cards may spill past the top and bottom of the container before they have fully faded out.
  // Without it the spiral, far taller than its box, spreads its cards over the neighboring sections.
  verticalFade?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1);
  return x * x * (3 - 2 * x);
};

export function PaintingSpiral({
  paintings,
  className,
  cardWidth = 160,
  cardHeight = 210,
  radius = 260,
  verticalSpacing = 78,
  cardsPerTurn = 8,
  speed = 0.4,
  centerScale = 1.15,
  edgeFade = 0.35,
  edgeBlur = 4,
  perspective = 1100,
  verticalFade,
}: PaintingSpiralProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || paintings.length === 0) return;

    // Animation state lives in the effect: it changes every frame and must never trigger a React render
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let bounds = root.getBoundingClientRect();
    let isVisible = false;
    let hasRendered = false;
    let isHovered = false;
    let isDragging = false;
    let lastPointerY = 0;
    let progress = 0;
    let targetProgress = 0;
    let autoSpeed = 0;
    let lastScrollY = window.scrollY;
    let previousTime = performance.now();
    let frameId = 0;

    const resizeObserver = new ResizeObserver(() => {
      bounds = root.getBoundingClientRect();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    resizeObserver.observe(root);
    intersectionObserver.observe(root);

    const onScroll = () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (!isVisible || reducedMotion.matches) return;
      targetProgress += clamp(delta / (verticalSpacing * 2), -1.5, 1.5);
    };

    // Mouse only: a touch drag would hijack vertical page scrolling on mobile
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      isDragging = true;
      lastPointerY = event.clientY;
      targetProgress = progress;
      root.setPointerCapture(event.pointerId);
      root.style.cursor = "grabbing";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      targetProgress -= (event.clientY - lastPointerY) / verticalSpacing;
      lastPointerY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
      root.style.cursor = "";
    };
    const onPointerEnter = () => {
      isHovered = true;
    };
    const onPointerLeave = () => {
      isHovered = false;
    };

    const render = (time: number) => {
      frameId = requestAnimationFrame(render);
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      if (!isVisible && hasRendered) return;
      hasRendered = true;

      const shouldAutoplay = isVisible && !reducedMotion.matches && !isDragging && !isHovered;
      autoSpeed += ((shouldAutoplay ? speed : 0) - autoSpeed) * (1 - Math.exp(-delta * 7));
      targetProgress += autoSpeed * delta;
      progress += (targetProgress - progress) * (1 - Math.exp(-delta * (isDragging ? 22 : 11)));

      const count = paintings.length;
      const half = count / 2;
      const fit = Math.min(1, bounds.width / (cardWidth * 2.8), bounds.height / (cardHeight * 2.35));
      const responsiveRadius = Math.min(radius, Math.max(72, bounds.width * 0.36)) * fit;
      const fadeStart = clamp(1 - edgeFade, 0, 0.98);

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const offset = modulo(index - progress + half, count) - half;
        const edge = Math.min(Math.abs(offset) / half, 1);
        const focus = 1 - Math.min(Math.abs(offset) / (cardsPerTurn * 0.65), 1);
        const angle = (offset * (360 / cardsPerTurn) * Math.PI) / 180;
        const x = Math.sin(angle) * responsiveRadius;
        const z = Math.cos(angle) * responsiveRadius;
        const depthScale = clamp(perspective / Math.max(perspective - z, 1), 0.72, 1.45);
        const scale = (1 + (centerScale - 1) * focus) * fit * depthScale;
        const blur = edgeBlur * smoothstep(0.35, 1, edge);
        const y = offset * verticalSpacing * fit;
        const halfHeight = bounds.height / 2;
        // Fades from the moment the card's edge meets the container edge until its center is verticalFade px past it
        const verticalOpacity =
          verticalFade === undefined
            ? 1
            : 1 - smoothstep(halfHeight - (cardHeight * scale) / 2, halfHeight + verticalFade, Math.abs(y));

        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        card.style.opacity = ((1 - smoothstep(fadeStart, 1, edge)) * verticalOpacity).toFixed(3);
        card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "none";
        card.style.zIndex = String(Math.round(((z / Math.max(responsiveRadius, 1) + 1) / 2) * 1000));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("pointerenter", onPointerEnter);
    root.addEventListener("pointerleave", onPointerLeave);
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("pointerenter", onPointerEnter);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [paintings, cardWidth, cardHeight, radius, verticalSpacing, cardsPerTurn, speed, centerScale, edgeFade, edgeBlur, perspective, verticalFade]);

  return (
    <div
      ref={rootRef}
      className={cn("relative isolate min-h-80 w-full cursor-grab select-none", className)}
      style={{ perspective }}
    >
      <ul aria-label="Galerie de tableaux" className="absolute inset-0 transform-3d">
        {paintings.map((painting, index) => (
          <li
            key={painting.id}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            // pointer-events-none: cards spilling out of the container must not block links underneath
            className="pointer-events-none absolute top-1/2 left-1/2 overflow-hidden bg-paper-deep shadow-[0_18px_40px_rgba(26,23,20,0.25)] backface-hidden will-change-[transform,opacity,filter]"
            // Hidden until the first frame positions the cards, otherwise they flash stacked in the center
            style={{ width: cardWidth, height: cardHeight, opacity: 0 }}
          >
            {painting.image &&
              (isWikimediaUrl(painting.image.src) ? (
                <WikimediaImage
                  src={painting.image.src}
                  originalWidth={painting.image.width ?? painting.image.minOriginalWidth}
                  alt={[painting.title, painting.artist].filter(Boolean).join(", ")}
                  fill
                  sizes={`${Math.round(cardWidth * 1.75)}px`}
                  draggable={false}
                  className="object-cover"
                />
              ) : (
                <Image
                  src={painting.image.src}
                  alt={[painting.title, painting.artist].filter(Boolean).join(", ")}
                  fill
                  sizes={`${Math.round(cardWidth * 1.75)}px`}
                  draggable={false}
                  className="object-cover"
                />
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
