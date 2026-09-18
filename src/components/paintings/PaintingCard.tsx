import { ImageReveal } from "@/components/animation/ImageReveal";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { Highlight } from "@/components/paintings/Highlight";
import { PaintingImage } from "@/components/paintings/PaintingImage";
import type { Painting, PaintingImage as PaintingImageData } from "@/lib/paintings";

// Tallest frame a card may show, as a multiple of its column width. The grid aligns cards on their bottom edge, so a
// portrait at full width (the Mona Lisa is 1.5 times taller than wide) would leave a tall gap above its row neighbours
const MAX_FRAME_HEIGHT = 1.1;

// Narrowed rather than cropped or letterboxed: the painting keeps its whole surface and its own proportions
function getFrameStyle(image: PaintingImageData | null) {
  // Without known dimensions PaintingImage falls back to a 4:5 frame
  const heightRatio = image?.width && image.height ? image.height / image.width : 5 / 4;
  if (heightRatio <= MAX_FRAME_HEIGHT) return undefined;
  return { maxWidth: `${((MAX_FRAME_HEIGHT / heightRatio) * 100).toFixed(2)}cqw` };
}

type PaintingCardProps = {
  painting: Painting;
  headingAs?: "h2" | "h3";
  sizes?: string;
  // Staggers cards that enter the viewport on the same row
  revealDelay?: number;
  // Search query whose matches get marked in the title, artist and movement
  highlight?: string;
};

export function PaintingCard({
  painting,
  headingAs: Heading = "h3",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  revealDelay = 0,
  highlight,
}: PaintingCardProps) {
  return (
    <TransitionLink href={`/tableaux/${painting.slug}`} transitionLabel={painting.title} data-cursor="Voir" className="group block">
      {/* The column is a size container so the frame can be narrowed relative to it */}
      <div className="[container-type:inline-size]">
        <ImageReveal delay={revealDelay} className="bg-paper-deep" style={getFrameStyle(painting.image)}>
          {/* Empty alt: the title right below already names the link */}
          <PaintingImage
            image={painting.image}
            alt=""
            sizes={sizes}
            className="transition-transform duration-700 ease-museum group-hover:scale-[1.03]"
          />
        </ImageReveal>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <Heading className="text-h3 transition-colors group-hover:text-accent">
          <Highlight text={painting.title} query={highlight} />
        </Heading>
        {painting.year !== null && (
          <span className="shrink-0 text-small text-ink-muted tabular-nums">{painting.year}</span>
        )}
      </div>
      <p className="mt-1 text-small text-ink-muted">
        <Highlight text={[painting.artist, painting.movement].filter(Boolean).join(", ")} query={highlight} />
      </p>
    </TransitionLink>
  );
}
