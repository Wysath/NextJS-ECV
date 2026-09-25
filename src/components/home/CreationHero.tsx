"use client";

import Image from "next/image";
import { useRef } from "react";
import { TextReveal } from "@/components/animation/TextReveal";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { Button } from "@/components/ui/Button";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { siteConfig } from "@/config/site";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { usePageReady } from "@/stores/site-store";
import adamCutout from "@/assets/creation/adam.webp";
import godCutout from "@/assets/creation/god.webp";

// The cutouts are local files, so the hero never depends on the catalogue answering: the home page keeps its h1
const FRESCO = { slug: "the-creation-of-adam", title: "La Création d’Adam" };

// The two halves meet at the top of the page, where the CSS already places them, and the pin pulls them apart as the
// visitor scrolls. Each value stays inside the margin the frame leaves around the figures (10% of the stage on
// desktop, 5% of the frame on phones): a larger one would crop the figures against the stage edge
const SPREAD = {
  desktop: {
    god: { xPercent: 16, yPercent: -14, rotate: 3 },
    adam: { xPercent: -22, yPercent: 16, rotate: -3 },
  },
  // Scaled from the outer corner, so the edge nearest the stage does not move
  mobile: {
    god: { xPercent: 6, scale: 0.92, transformOrigin: "100% 0%" },
    adam: { xPercent: -6, scale: 0.92, transformOrigin: "0% 100%" },
  },
};

export function CreationHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const isPageReady = usePageReady();

  useGSAP(
    () => {
      if (!isPageReady) return;
      const mm = gsap.matchMedia();
      mm.add(
        // matchMedia only calls back when a condition matches, so phones need a condition of their own
        { isDesktop: "(min-width: 1024px)", isMobile: "(max-width: 1023px)", reduceMotion: "(prefers-reduced-motion: reduce)" },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};
          // Without motion the hero keeps its resting layout, where the two halves already meet
          if (reduceMotion) return;
          const header = document.querySelector("header");

          const spread = isDesktop ? SPREAD.desktop : SPREAD.mobile;

          // Arrival, on the outer wrappers: the inner ones belong to the scroll timeline, and both would fight over
          // the transform. Scaled up rather than slid in: sliding in from the side would crop the figures
          gsap
            .timeline({ defaults: { ease: "expo.out" } })
            .from("[data-enter='god']", { scale: 0.94, autoAlpha: 0, duration: 1.8 }, 0)
            .from("[data-enter='adam']", { scale: 0.94, autoAlpha: 0, duration: 1.8 }, 0.1)
            .from("[data-enter='fade']", { y: 20, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 0.6);

          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: sectionRef.current,
                // The header is sticky, so the stage pins right below it rather than under it
                start: () => `top ${header?.offsetHeight ?? 0}px`,
                end: isDesktop ? "+=140%" : "+=100%",
                pin: true,
                // Created after the theme wheel further down (this one waits for the page to be ready), yet its pin
                // spacer shifts that wheel: it must be measured first
                refreshPriority: 2,
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            })
            .fromTo("[data-creation='word']", { xPercent: 8 }, { xPercent: -28, duration: 1 }, 0)
            // to(), not fromTo(): the start of the spread is the layout the CSS already renders, so nothing is
            // written to the figures before the first scroll and the fresco cannot flash apart on load
            .to("[data-creation='god']", { ...spread.god, duration: 0.8 }, 0)
            .to("[data-creation='adam']", { ...spread.adam, duration: 0.8 }, 0)
            .to("[data-creation='cue']", { autoAlpha: 0, duration: 0.1 }, 0);

          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        },
      );
    },
    { scope: sectionRef, dependencies: [isPageReady] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-20 isolate flex h-[calc(100svh-var(--spacing-header))] min-h-120 flex-col overflow-hidden bg-ink text-paper"
    >
      <p
        data-creation="word"
        aria-hidden
        className="absolute top-1/2 left-0 -z-10 -translate-y-1/2 font-display text-[28vw] leading-none font-semibold whitespace-nowrap text-transparent uppercase select-none [-webkit-text-stroke:1px_rgb(250_247_241/0.12)]"
      >
        {siteConfig.name}
      </p>

      {/* Text only goes where the composition leaves the ink bare: over the fresco it could not be read.
          Phones: in the flow above the figures. From lg: heading in the top left corner, above Adam and left of God,
          buttons in the bottom right one, under God */}
      <div className="relative z-40 mx-gutter mt-5 flex flex-col lg:absolute lg:inset-x-gutter lg:top-[6%] lg:bottom-6 lg:m-0">
        <TextReveal trigger="load" className="max-w-xl">
          {/* Sized on the viewport height from lg: the heading must end above Adam's head on short screens too */}
          <h1 className="type-display text-display font-semibold lg:text-[clamp(3rem,10svh,6.5rem)]">
            Cinq mille ans
            <br />
            <span className="font-extralight">d’art.</span>
          </h1>
        </TextReveal>
        <div data-enter="fade" className="mt-6 flex flex-wrap gap-3 lg:mt-auto lg:self-end">
          <Button href="/billetterie" variant="light" size="sm">
            Réserver une visite
          </Button>
          <Button href="/tableaux" variant="outline-light" size="sm">
            Explorer les tableaux
          </Button>
        </div>
      </div>

      {/* The space left by the text, as a size container: the frame below fits it in both directions, so no figure is
          ever cropped by the stage, whatever its ratio */}
      <div className="relative my-6 min-h-0 flex-1 [container-type:size] lg:absolute lg:inset-0 lg:m-0">
        {/* Phones: the halves stacked diagonally, overlapping where God's arm meets Adam's hand. From lg: the fresco's
            own ratio, each cutout at its original place so both halves rebuild the composition. Both keep a margin
            around the figures for the spread */}
        <div className="absolute inset-0 m-auto h-[min(91.4cqw,100cqh)] w-[min(100cqw,109.4cqh)] lg:h-[min(36.3cqw,72.6cqh)] lg:w-[min(80cqw,160cqh)]">
          <div
            data-enter="god"
            className="absolute top-0 right-[5%] z-10 w-[78%] lg:top-[1.19%] lg:right-auto lg:left-[37.88%] lg:w-[62.12%]"
          >
            <div data-creation="god">
              {/* The largest image above the fold: fetched first */}
              <Image
                src={godCutout}
                alt=""
                sizes="(min-width: 1024px) 50vw, 80vw"
                loading="eager"
                fetchPriority="high"
                className="h-auto w-full"
              />
            </div>
          </div>
          <div
            data-enter="adam"
            className="absolute top-[37.2%] left-[5%] z-30 w-[78%] lg:top-[30.71%] lg:left-0 lg:w-[42.71%]"
          >
            <div data-creation="adam">
              <Image
                src={adamCutout}
                alt=""
                sizes="(min-width: 1024px) 35vw, 80vw"
                loading="eager"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Credited on screen, as the fresco is in the Sistine Chapel, not at the Met. Bottom left from lg, under Adam */}
      <TransitionLink
        data-enter="fade"
        href={`/tableaux/${FRESCO.slug}`}
        transitionLabel={FRESCO.title}
        className="relative z-40 mx-gutter mb-4 w-fit self-end bg-ink/70 px-3 py-1.5 text-right text-small text-paper/80 transition-colors hover:text-paper lg:absolute lg:bottom-6 lg:left-gutter lg:m-0 lg:text-left"
      >
        Michel-Ange, <em>{FRESCO.title}</em>, chapelle Sixtine
      </TransitionLink>

      <div data-creation="cue" className="absolute bottom-6 left-1/2 z-40 hidden -translate-x-1/2 lg:block">
        <ScrollIndicator />
      </div>
    </section>
  );
}
