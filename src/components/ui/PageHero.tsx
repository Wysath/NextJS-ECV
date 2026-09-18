import type { ReactNode } from "react";
import { DrawnStrokes } from "@/components/animation/DrawnStrokes";
import { TextReveal } from "@/components/animation/TextReveal";

type PageHeroProps = {
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
};

export function PageHero({ title, intro, children }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <DrawnStrokes placements={["top-right"]} size="lg" />
      <div className="wrapper pt-12 pb-12 md:pt-16 md:pb-20">
        <div className="max-w-4xl">
          <TextReveal trigger="load">
            <h1 className="text-h1">{title}</h1>
          </TextReveal>
          {intro && <p className="mt-8 max-w-prose text-lead text-ink-muted">{intro}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
