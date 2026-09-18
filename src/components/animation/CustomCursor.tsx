"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type CursorMode = "hidden" | "default" | "link" | "label" | "text";

const INTERACTIVE_SELECTOR = "a, button, select, summary, label, [role=button], [role=option]";
// Typing needs the native caret cursor to place the insertion point precisely
const TEXT_FIELD_SELECTOR =
  "input:not([type=checkbox], [type=radio], [type=range], [type=submit], [type=button]), textarea, [contenteditable=true]";

const RING_SCALE: Record<CursorMode, number> = { hidden: 0.4, default: 1, link: 1.6, label: 0.4, text: 0.4 };
const PRESS_FACTOR = 0.8;

export function CustomCursor() {
  const pathname = usePathname();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  // Filled once the cursor is wired; lets a page change drop a hover state whose element no longer exists
  const resetRef = useRef<() => void>(() => {});

  useGSAP(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const bubble = bubbleRef.current;
    if (!dot || !ring || !bubble) return;
    // Touch screens and pens have no hovering pointer to follow
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cursors = [dot, ring, bubble];
    gsap.set(cursors, { xPercent: -50, yPercent: -50 });
    gsap.set(bubble, { scale: 0 });
    gsap.set(ring, { scale: RING_SCALE.hidden });

    // quickTo reuses one tween per axis instead of creating one per pointer event
    const follow = (element: HTMLElement, duration: number) => ({
      x: gsap.quickTo(element, "x", { duration: isReduced ? 0 : duration, ease: "power3" }),
      y: gsap.quickTo(element, "y", { duration: isReduced ? 0 : duration, ease: "power3" }),
    });
    // The dot stays glued to the pointer, the ring and the bubble trail behind it
    const movers = [follow(dot, 0.08), follow(ring, 0.45), follow(bubble, 0.3)];

    let mode: CursorMode = "hidden";
    let label = "";
    let isPressed = false;
    let pointer: { x: number; y: number } | null = null;

    const animateMode = () => {
      const duration = isReduced ? 0 : 0.35;
      const press = isPressed ? PRESS_FACTOR : 1;
      gsap.to(dot, {
        autoAlpha: mode === "default" ? 1 : 0,
        scale: mode === "default" ? 1 : 0,
        duration,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(ring, {
        autoAlpha: mode === "default" || mode === "link" ? 1 : 0,
        scale: RING_SCALE[mode] * press,
        duration,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(bubble, {
        autoAlpha: mode === "label" ? 1 : 0,
        scale: mode === "label" ? press : 0,
        duration,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const setMode = (nextMode: CursorMode, nextLabel = "") => {
      if (nextMode === mode && nextLabel === label) return;
      mode = nextMode;
      label = nextLabel;
      // Keeps the previous word while the bubble shrinks away instead of emptying it mid-animation
      if (nextLabel && labelRef.current) labelRef.current.textContent = nextLabel;
      animateMode();
    };

    const resolveMode = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return setMode("default");
      if (target.closest(TEXT_FIELD_SELECTOR)) return setMode("text");
      const labelled = target.closest<HTMLElement>("[data-cursor]");
      if (labelled?.dataset.cursor) return setMode("label", labelled.dataset.cursor);
      setMode(target.closest(INTERACTIVE_SELECTOR) ? "link" : "default");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const isEntering = pointer === null;
      pointer = { x: event.clientX, y: event.clientY };
      // On entry the cursor jumps to the pointer rather than gliding in from its last position
      for (const mover of movers) {
        mover.x(event.clientX, isEntering ? event.clientX : undefined);
        mover.y(event.clientY, isEntering ? event.clientY : undefined);
      }
      if (isEntering) resolveMode(event.target);
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && pointer) resolveMode(event.target);
    };

    const onPointerLeave = () => {
      pointer = null;
      setMode("hidden");
    };

    const onPointerDown = () => {
      isPressed = true;
      animateMode();
    };

    const onPointerUp = () => {
      isPressed = false;
      animateMode();
    };

    resetRef.current = () => {
      if (pointer) resolveMode(document.elementFromPoint(pointer.x, pointer.y));
    };

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      root.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      resetRef.current = () => {};
    };
  });

  // The hovered card may be gone after a navigation even though the pointer did not move
  useEffect(() => {
    resetRef.current();
  }, [pathname]);

  // Three separate fixed elements: a shared fixed wrapper would isolate them and cancel the difference blending
  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-200 size-10 rounded-full border border-paper mix-blend-difference"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-200 size-1.5 rounded-full bg-paper mix-blend-difference"
      />
      <div
        ref={bubbleRef}
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-200 flex size-22 items-center justify-center rounded-full bg-accent text-small font-medium text-paper"
      >
        <span ref={labelRef} />
      </div>
    </>
  );
}
