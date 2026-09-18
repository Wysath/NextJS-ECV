import Image from "next/image";
import { DrawnStrokes } from "@/components/animation/DrawnStrokes";
import { ImageReveal } from "@/components/animation/ImageReveal";
import { TextReveal } from "@/components/animation/TextReveal";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { museumEvents } from "@/data/museum-events";

const pad = (value: number) => String(value).padStart(2, "0");

export function UpcomingEvents() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper">
      <DrawnStrokes placements={["top-right"]} tone="dark" size="lg" trigger="scroll" />

      <div className="wrapper py-section">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <TextReveal>
              <h2 className="type-display text-display font-light">
                Rendez-vous
                <br />
                <span className="font-semibold">à venir</span>
              </h2>
            </TextReveal>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-lead text-paper/70">
              Visites guidées, nocturnes et ateliers : le musée se découvre aussi accompagné. Chaque rendez-vous se
              réserve avec votre billet d’entrée.
            </p>
            <Button href="/billetterie" variant="light" className="mt-8">
              Réserver un billet
            </Button>
          </div>
        </div>

        <ul className="mt-20 grid gap-14 md:mt-28 md:gap-16">
          {museumEvents.map((event, index) => (
            <li key={event.slug}>
              <TransitionLink
                href="/billetterie"
                data-cursor="Réserver"
                className="group grid gap-6 md:grid-cols-12 md:items-center md:gap-10"
              >
                <div className="md:col-span-4">
                  <div className="mt-3 flex items-start justify-between gap-6">
                    <h3 className="type-display text-h1 font-light">{event.title}</h3>
                    <ArrowRightIcon className="mt-2 size-8 shrink-0 -rotate-45 transition-transform duration-500 ease-museum group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <p className="mt-4 type-label text-paper">{event.schedule}</p>
                  <p className="mt-3 max-w-sm text-small text-paper/60">{event.description}</p>
                </div>

                {/* Rounded on the frame, not the image, so the clip reveal and the parallax stay inside the pill */}
                <ImageReveal
                  delay={0.1}
                  parallax={8}
                  className="relative aspect-5/2 rounded-full bg-paper/10 md:col-span-8 md:aspect-4/1"
                  innerClassName="absolute inset-0"
                >
                  <Image
                    src={event.artwork.src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-museum group-hover:scale-105"
                  />
                </ImageReveal>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
