import { ImageReveal } from "@/components/animation/ImageReveal";
import { TextReveal } from "@/components/animation/TextReveal";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { PaintingImage } from "@/components/paintings/PaintingImage";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { getExcerpt, type Painting } from "@/lib/paintings";

type FeaturedArtworkRowProps = {
  painting: Painting;
  index: number;
};

export function FeaturedArtworkRow({ painting, index }: FeaturedArtworkRowProps) {
  const href = `/tableaux/${painting.slug}`;
  const isReversed = index % 2 === 1;
  const { width, height } = painting.image ?? {};
  const isPortrait = width !== undefined && height !== undefined && height > width;

  return (
    <li className="grid items-center gap-8 md:grid-cols-12 md:gap-0">
      {/* Out of the tab order: the title link below leads to the same page */}
      <TransitionLink
        href={href} transitionLabel={painting.title}
        tabIndex={-1}
        aria-hidden
        className={cn(
          "group block",
          isPortrait ? "md:col-span-6" : "md:col-span-8",
          isReversed && (isPortrait ? "md:col-start-7" : "md:col-start-5"),
        )}
      >
        {/* Reveal without parallax: the painting is shown whole, never cropped */}
        <ImageReveal>
          <PaintingImage
            image={painting.image}
            alt=""
            sizes={isPortrait ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 67vw, 100vw"}
            className="transition-transform duration-700 ease-museum group-hover:scale-[1.03]"
          />
        </ImageReveal>
      </TransitionLink>

      <div
        className={cn(
          "px-gutter md:py-8",
          isPortrait ? "md:col-span-6" : "md:col-span-4",
          isReversed && "md:col-start-1 md:row-start-1",
        )}
      >
        <TextReveal>
          <p className="type-numeral text-h1 text-accent">{String(index + 1).padStart(2, "0")}</p>
        </TextReveal>
        <TextReveal className="mt-6" delay={0.1}>
          <h3 className="text-h2">
            <TransitionLink href={href} transitionLabel={painting.title} className="transition-colors hover:text-accent">
              {painting.title}
            </TransitionLink>
          </h3>
        </TextReveal>
        <p className="eyebrow mt-4 text-ink-muted">
          {[painting.artist, painting.year].filter(Boolean).join(", ")}
        </p>
        {painting.description && (
          <p className="mt-6 max-w-sm text-ink-muted">{getExcerpt(painting.description, 200)}</p>
        )}
        <TransitionLink
          href={href} transitionLabel={painting.title}
          className="link-underline link-cta mt-8"
        >
          Découvrir l’œuvre
          <ArrowRightIcon className="size-4" />
        </TransitionLink>
      </div>
    </li>
  );
}
