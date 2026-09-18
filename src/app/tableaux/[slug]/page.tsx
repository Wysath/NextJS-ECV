import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { DrawnStrokes } from "@/components/animation/DrawnStrokes";
import { ImageReveal } from "@/components/animation/ImageReveal";
import { TextReveal } from "@/components/animation/TextReveal";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { PaintingCard } from "@/components/paintings/PaintingCard";
import { PaintingDescription } from "@/components/paintings/PaintingDescription";
import { PaintingDetail, hasDetailQuality } from "@/components/paintings/PaintingDetail";
import { PaintingImage } from "@/components/paintings/PaintingImage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { getPainting, getPaintings } from "@/lib/museum-api";
import { getExcerpt, getSimilarPaintings, getTypeLabel, splitTitle } from "@/lib/paintings";
import { getBreadcrumbSchema, getPaintingSchema } from "@/lib/structured-data";
import { getShareImageUrl } from "@/lib/wikimedia";

// Every known painting is prerendered at build (SSG) then regenerated at most hourly (ISR).
// Slugs added to the API later are rendered on first visit, since dynamicParams stays true.
export const revalidate = 3600;

// Past this length the display size stacks the title on four or five lines and pushes the rest out of view
const LONG_TITLE_LENGTH = 24;

export async function generateStaticParams() {
  const paintings = await getPaintings();
  return paintings.map((painting) => ({ slug: painting.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tableaux/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const painting = await getPainting(slug);
  if (!painting) return {};

  const description = painting.description ? getExcerpt(painting.description, 160) : undefined;
  return {
    title: [painting.title, painting.artist].filter(Boolean).join(", "),
    description,
    alternates: { canonical: `/tableaux/${painting.slug}` },
    openGraph: {
      title: painting.title,
      description,
      type: "article",
      images: painting.image ? [{ url: getShareImageUrl(painting.image) }] : undefined,
    },
  };
}

export default async function PaintingPage({ params }: PageProps<"/tableaux/[slug]">) {
  const { slug } = await params;
  const [painting, paintings] = await Promise.all([getPainting(slug), getPaintings()]);
  if (!painting) notFound();

  const similarPaintings = getSimilarPaintings(painting, paintings, 3);
  const titleLines = splitTitle(painting.title);
  const hasDetail = hasDetailQuality(painting.image);
  const details = [
    { label: "Titre original", value: painting.originalTitle !== painting.title ? painting.originalTitle : null },
    { label: "Artiste", value: painting.artist },
    { label: "Année", value: painting.year?.toString() ?? null },
    { label: "Mouvement", value: painting.movement },
    { label: "Technique", value: getTypeLabel(painting.type) },
    { label: "Couleur dominante", value: painting.color },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  return (
    <>
      <JsonLd schema={getPaintingSchema(painting)} />
      <JsonLd
        schema={getBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Tableaux", path: "/tableaux" },
          { name: painting.title, path: `/tableaux/${painting.slug}` },
        ])}
      />

      <section className="bg-ink p-2 md:p-3">
        {/* A fixed height rather than a minimum: the detail crop shrinks to absorb long titles instead of pushing
            the hero past the fold. The floor keeps very short windows from clipping the text. */}
        <div className="grid md:h-[calc(100svh-var(--spacing-header)-1.5rem)] md:min-h-144 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] lg:grid-cols-12">
          {/* Stacked on mobile, the painting alone fills the first screen (minus the header and the frame padding) */}
          <div className="relative flex min-h-[calc(100svh-var(--spacing-header)-1rem)] items-center justify-center overflow-hidden px-6 py-12 md:min-h-0 md:p-12 lg:col-span-7">
            {/* Soft light from above, like a picture hung on a gallery wall */}
            <div
              aria-hidden
              className="absolute inset-0, transparent_65%)]"
            />
            {/* Keyed by slug so a painting-to-painting navigation plays the entrance again */}
            <ImageReveal key={painting.slug} trigger="load" className="relative w-full">
              <PaintingImage
                image={painting.image}
                alt={[painting.title, painting.artist].filter(Boolean).join(", ")}
                sizes="(min-width: 1024px) 55vw, (min-width: 768px) 45vw, 100vw"
                fit="contain"
                preload
              />
            </ImageReveal>
            <ScrollIndicator className="absolute bottom-5 left-1/2 -translate-x-1/2" />
          </div>

          <div className="relative isolate flex flex-col gap-12 overflow-hidden bg-paper px-gutter py-8 md:gap-8 md:px-10 lg:col-span-5 lg:px-14">
            <DrawnStrokes key={`${painting.slug}-strokes`} />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <TransitionLink
                href="/tableaux"
                className="link-underline link-cta"
              >
                <ArrowRightIcon className="size-4 rotate-180" />
                Tous les tableaux
              </TransitionLink>
              <FavoriteButton slug={painting.slug} />
            </div>

            <TextReveal key={`${painting.slug}-title`} trigger="load" className="relative md:mt-auto">
              <h1 className={cn("type-display", painting.title.length > LONG_TITLE_LENGTH ? "text-h1" : "text-display")}>
                {titleLines.map((line, lineIndex) => (
                  <span key={lineIndex} className={cn("block", lineIndex === 1 && "text-right")}>
                    {line.map((word, wordIndex) => (
                      <Fragment key={wordIndex}>
                        {wordIndex > 0 && " "}
                        <span className={word.isEmphasized ? "font-semibold" : "font-extralight"}>{word.text}</span>
                      </Fragment>
                    ))}
                  </span>
                ))}
              </h1>
            </TextReveal>

            <div
              className={cn(
                "relative grid items-end gap-8",
                hasDetail &&
                  "sm:grid-cols-[1fr_minmax(0,14rem)] md:min-h-0 md:grid-rows-[minmax(0,1fr)] lg:grid-cols-[1fr_minmax(0,15rem)]",
              )}
            >
              <div>
                {painting.artist && <p className="type-statement text-h3">{painting.artist}</p>}
                <p className="mt-2 text-ink-muted">
                  {[painting.year, getTypeLabel(painting.type)].filter(Boolean).join(", ")}
                </p>
                {painting.color && (
                  <p className="mt-6 text-small text-ink-muted">
                    <span className="eyebrow mr-2 text-ink">Palette</span>
                    {painting.color}
                  </p>
                )}
              </div>
              {hasDetail && painting.image && (
                <PaintingDetail
                  key={painting.slug}
                  image={painting.image}
                  className="w-3/5 justify-self-end sm:w-full md:self-stretch"
                />
              )}
            </div>

            <div className="relative flex flex-wrap items-center gap-x-8 gap-y-4 md:mt-auto md:justify-end">
              <a href="#notice" className={buttonClasses()}>
                Lire la notice
              </a>
              {/* Only a painting actually held by the Met leads to this site's ticketing, the others to their own museum */}
              {painting.location?.includes("Metropolitan Museum of Art") ? (
                <TransitionLink href="/billetterie" className="link-underline link-cta">
                  Réserver pour la voir au Met
                  <ArrowRightIcon className="size-4 -rotate-45" />
                </TransitionLink>
              ) : painting.location && painting.locationLink && (
                <a
                  href={painting.locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline link-cta"
                >
                  Où la voir : {painting.location}
                  <ArrowRightIcon className="size-4 -rotate-45" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="notice" className="wrapper grid gap-12 py-section md:grid-cols-12">
        <aside className="md:col-span-4">
          <div className="md:sticky md:top-[calc(var(--spacing-header)+2rem)]">
            <h2 className="eyebrow text-accent">Fiche de l’œuvre</h2>
            <dl className="mt-6 divide-y border-y">
              {details.map((detail) => (
                <div key={detail.label} className="flex justify-between gap-6 py-4">
                  <dt className="text-small text-ink-muted">{detail.label}</dt>
                  <dd className="text-right">{detail.value}</dd>
                </div>
              ))}
              {painting.location && (
                <div className="py-4">
                  <dt className="text-small text-ink-muted">Lieu de conservation</dt>
                  <dd className="mt-1">
                    {painting.locationLink ? (
                      <a
                        href={painting.locationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline pb-0.5"
                      >
                        {painting.location}
                      </a>
                    ) : (
                      painting.location
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>

        {painting.description && (
          <div className="md:col-span-7 md:col-start-6">
            <h2 className="sr-only">Description</h2>
            <PaintingDescription html={painting.description} />
          </div>
        )}
      </section>

      {painting.gallery.length > 0 && (
        <section className="wrapper pb-section">
          <h2 className="eyebrow text-accent">Autres vues</h2>
          <ul className="mt-8 grid items-end gap-8 sm:grid-cols-2">
            {painting.gallery.map((image, index) => (
              <li key={image.src}>
                <ImageReveal delay={(index % 2) * 0.1}>
                  <PaintingImage
                    image={image}
                    alt={`${painting.title}, vue ${index + 2}`}
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                </ImageReveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {similarPaintings.length > 0 && (
        <section className="border-t">
          <div className="wrapper py-section">
            <SectionHeading
              title="Dans le même esprit"
              action={
                <TransitionLink
                  href="/tableaux"
                  className="link-underline link-cta"
                >
                  Voir tous les tableaux
                  <ArrowRightIcon className="size-4" />
                </TransitionLink>
              }
            />
            <ul className="mt-16 grid items-end gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {similarPaintings.map((similar, index) => (
                <li key={similar.id}>
                  <PaintingCard painting={similar} revealDelay={index * 0.06} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
