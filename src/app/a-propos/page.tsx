import type { Metadata } from "next";
import Image from "next/image";
import { AboutTimeline } from "@/components/about/AboutTimeline";
import { KeyFigures, type KeyFigure } from "@/components/about/KeyFigures";
import { DrawnStrokes } from "@/components/animation/DrawnStrokes";
import { ImageReveal } from "@/components/animation/ImageReveal";
import { TextReveal } from "@/components/animation/TextReveal";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { departments, milestones, sites } from "@/data/about";
import { aboutArtwork } from "@/data/featured-artworks";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Fondé en 1870, le Metropolitan Museum of Art réunit plus d’un million et demi d’œuvres couvrant cinq mille ans d’histoire, sur la Cinquième Avenue et aux Cloisters.",
  alternates: { canonical: "/a-propos" },
};

const facts: KeyFigure[] = [
  { value: 1870, label: "Année de fondation" },
  { value: 1.5, decimals: 1, unit: "M", label: "Œuvres en collection" },
  { value: 17, label: "Départements" },
  { value: 5.7, decimals: 1, unit: "M", label: "Visiteurs en 2024" },
];

const credit = (artwork: { title: string; artist: string; date: string }) =>
  `${artwork.title}, ${artwork.artist}, ${artwork.date}`;

export default function AboutPage() {
  return (
    <>
      <section className="bg-paper-deep">
        <div className="grid md:grid-cols-12">
          <figure className="relative aspect-square overflow-hidden md:col-span-6 md:aspect-auto md:min-h-[calc(100svh-var(--spacing-header))]">
            <ImageReveal trigger="load" parallax={8} className="absolute inset-0" innerClassName="relative size-full">
              <Image
                src={aboutArtwork.src}
                alt={credit(aboutArtwork)}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                loading="eager"
                fetchPriority="high"
                className="scale-115 object-cover"
              />
            </ImageReveal>
            <figcaption className="absolute bottom-4 left-4 bg-ink/70 px-3 py-1.5 text-small text-paper">
              {aboutArtwork.artist}, <em>{aboutArtwork.title}</em>, {aboutArtwork.date}
            </figcaption>
          </figure>

          <div className="relative isolate flex flex-col justify-center overflow-hidden px-gutter py-section md:col-span-6 md:pl-16 lg:pl-24">
            <DrawnStrokes />
            <TextReveal trigger="load">
              <h1 className="text-h1">Un musée encyclopédique au cœur de Manhattan</h1>
            </TextReveal>
            <div className="mt-10 max-w-xl space-y-6 text-lead">
              <p>
                Fondé en 1870 par un groupe de citoyens, d’artistes et de mécènes new-yorkais, le
                Metropolitan Museum of Art réunit aujourd’hui plus d’un million et demi d’œuvres
                couvrant cinq mille ans d’histoire.
              </p>
              <p className="text-ink-muted">
                Des temples égyptiens aux toiles modernes, ses collections parcourent toutes les
                époques et tous les continents, sur deux sites new-yorkais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Above the next section, whose drawn stroke spills upward and would cross the dark band */}
      <section className="relative z-10 bg-ink text-paper">
        <KeyFigures figures={facts} />
      </section>

      <section>
        {/* Clipped here rather than on the section: an overflow on the ancestor would trap the sticky panels */}
        <div className="relative isolate overflow-x-clip">
          <DrawnStrokes placements={["top-right"]} size="lg" trigger="scroll" />
          <div className="wrapper py-section">
            <TextReveal>
              <h2 className="max-w-3xl text-h1">Un siècle et demi sur la Cinquième Avenue</h2>
            </TextReveal>
          </div>
        </div>
        <AboutTimeline milestones={milestones} />
      </section>

      <section className="bg-paper-deep">
        <div className="wrapper py-section">
          <SectionHeading
            title="Cinq mille ans, dix-sept départements"
            intro="Chaque département a ses conservateurs, ses galeries et ses réserves. En voici six, parmi les plus visités."
          />
          <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((department, index) => (
              <li key={department.name}>
                <figure>
                  <ImageReveal delay={(index % 3) * 0.06} parallax={6} className="aspect-4/5 bg-paper" innerClassName="relative size-full">
                    <Image
                      src={department.artwork.src}
                      alt={credit(department.artwork)}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="scale-110 object-cover"
                    />
                  </ImageReveal>
                  <figcaption className="mt-5">
                    <h3 className="text-h3">{department.name}</h3>
                    <p className="mt-1 text-small text-ink-muted">
                      <em>{department.artwork.title}</em>, {department.artwork.artist}, {department.artwork.date}
                    </p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <DrawnStrokes placements={["top-left"]} tone="dark" size="lg" trigger="scroll" />
        <div className="wrapper py-section">
          <TextReveal>
            <h2 className="max-w-3xl text-h1">Un musée, deux sites à Manhattan</h2>
          </TextReveal>
          <div className="mt-16 grid gap-16 md:grid-cols-2 md:gap-10">
            {sites.map((site) => (
              <article key={site.name}>
                <ImageReveal parallax={8} className="aspect-4/3" innerClassName="relative size-full">
                  <Image
                    src={site.artwork.src}
                    alt={credit(site.artwork)}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="scale-110 object-cover"
                  />
                </ImageReveal>
                <h3 className="mt-8 text-h2">{site.name}</h3>
                <p className="eyebrow mt-4 text-paper/60">{site.location}</p>
                <p className="mt-5 max-w-md text-paper/80">{site.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <div className="wrapper grid gap-12 py-section md:grid-cols-12">
          <div className="md:col-span-6">
            <TextReveal>
              <p className="type-statement text-h2">
                Une galerie en ligne de <span className="font-medium text-accent">chefs-d’œuvre de la peinture</span>,
                pour préparer sa visite ou regarder de plus près.
              </p>
            </TextReveal>
          </div>
          <div className="space-y-6 md:col-span-5 md:col-start-8 md:self-end">
            <p>
              Ce projet étudiant propose un parcours à travers une sélection de tableaux conservés dans
              les grands musées du monde. Chaque fiche indique où voir l’œuvre, et la billetterie simule
              la réservation d’une visite au Met.
            </p>
            <p className="text-ink-muted">
              Il n’a aucun lien officiel avec le musée. Les œuvres proviennent de l’API Museum, les images
              de Wikimedia, du MoMA et du programme Open Access du Met, qui place ses œuvres du domaine
              public sous licence Creative Commons Zero.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button href="/tableaux">Explorer les tableaux</Button>
              <Button href="/billetterie" variant="outline">
                Réserver une visite
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
