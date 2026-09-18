import type { Metadata } from "next";
import Image from "next/image";
import { DrawnStrokes } from "@/components/animation/DrawnStrokes";
import { ImageReveal } from "@/components/animation/ImageReveal";
import { TextReveal } from "@/components/animation/TextReveal";
import { CreationHero } from "@/components/home/CreationHero";
import { PaintingSpiral } from "@/components/home/PaintingSpiral";
import { ThemeWheel } from "@/components/home/ThemeWheel";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { museumArtwork } from "@/data/featured-artworks";
import { getPaintings } from "@/lib/museum-api";
import { EMPTY_FILTERS, filtersToHref, groupByTheme } from "@/lib/paintings";
import { getMuseumSchema, getWebSiteSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Static page refreshed through the cached API data (ISR), like the painting pages
export default async function HomePage() {
  const paintings = await getPaintings();
  // Only what the wheel displays crosses to the client, not every painting with its description
  const themes = groupByTheme(paintings).map(({ theme, paintings: themePaintings }) => ({
    slug: theme.slug,
    label: theme.label,
    description: theme.description,
    href: filtersToHref({ ...EMPTY_FILTERS, theme: theme.slug }),
    cover: themePaintings.find((painting) => painting.image)?.image ?? null,
  }));
  const spiralPaintings = paintings.filter((painting) => painting.image);

  return (
    <>
      <JsonLd schema={getMuseumSchema()} />
      <JsonLd schema={getWebSiteSchema()} />

      <CreationHero />

      {/* z-10 lets the spiral spill a little over its neighbors (verticalFade keeps it off the theme links);
          the hero sits above at z-20, and x-clip avoids horizontal scroll */}
      <section className="relative z-10 overflow-x-clip">
        <DrawnStrokes placements={["top-left"]} size="lg" trigger="scroll" />
        <div className="wrapper grid items-center gap-12 py-section md:grid-cols-12">
          <div className="relative z-10 md:col-span-6">
            <TextReveal>
              <p className="type-statement text-h2">
                Des primitifs flamands aux avant-gardes,{" "}
                <span className="font-medium text-accent">les chefs-d’œuvre de la peinture</span> réunis dans une galerie à
                regarder de près. Chaque œuvre indique le musée où la voir.
              </p>
            </TextReveal>
          </div>
          {/* Clipped on mobile, where the stacked layout would put cards over the text above */}
          <PaintingSpiral
            paintings={spiralPaintings}
            edgeFade={0.5}
            verticalFade={80}
            className="h-[70svh] overflow-hidden md:col-span-6 md:h-[85svh] md:overflow-visible"
          />
        </div>
      </section>

      <section className="relative isolate flex min-h-[85svh] items-end overflow-hidden bg-ink text-paper">
        <ImageReveal parallax={12} className="absolute inset-0 -z-10" innerClassName="relative size-full">
          <Image src={museumArtwork.src} alt="" fill sizes="100vw" className="scale-105 object-cover object-[62%_center]" />
        </ImageReveal>
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink/95 via-ink/35 to-ink/10" />

        <div className="wrapper grid gap-10 py-section md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <TextReveal>
              <h2 className="type-display text-display font-semibold">
                Un musée à voir
                <br />
                <span className="font-extralight">en vrai.</span>
              </h2>
            </TextReveal>
            <p className="mt-8 max-w-xl text-lead text-paper/80">
              Dix-sept départements, deux sites à Manhattan et des chefs-d’œuvre qui ne se révèlent qu’en face à face,
              comme cette toile de David conservée au Met.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/billetterie" variant="light">
                Réserver une visite
              </Button>
              <Button href="/a-propos" variant="outline-light">
                Découvrir le musée
              </Button>
            </div>
          </div>
          <p className="text-small text-paper/70 md:col-span-3 md:col-start-10 md:text-right">
            <span className="type-label block text-paper">{museumArtwork.title}</span>
            {museumArtwork.artist}, {museumArtwork.date}
          </p>
        </div>
      </section>

      <ThemeWheel themes={themes} />

      <UpcomingEvents />

      <section className="relative isolate overflow-hidden bg-paper-deep">
        <DrawnStrokes placements={["top-right"]} size="lg" trigger="scroll" />

        <div className="wrapper grid gap-12 py-section md:grid-cols-12">
          <div className="md:col-span-5">
            <TextReveal>
              <h2 className="text-h1">Préparer sa visite</h2>
            </TextReveal>
            <Button href="/billetterie" className="mt-10">
              Acheter un billet
            </Button>
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <h3 className="eyebrow text-ink-muted">Horaires</h3>
            <ul className="mt-5 divide-y divide-line">
              {siteConfig.hours.map((slot) => (
                <li key={slot.days} className="py-3">
                  <span className="block">{slot.days}</span>
                  <span className="text-small text-ink-muted">{slot.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3 md:col-start-10">
            <h3 className="eyebrow text-ink-muted">Adresse</h3>
            <address className="mt-5 not-italic">
              {siteConfig.address.street}
              <br />
              {siteConfig.address.city}
              <br />
              {siteConfig.address.country}
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
