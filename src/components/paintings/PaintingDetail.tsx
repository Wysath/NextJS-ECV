import { ImageReveal } from "@/components/animation/ImageReveal";
import { PaintingCoverImage } from "@/components/paintings/PaintingCoverImage";
import { cn } from "@/lib/cn";
import type { PaintingImage } from "@/lib/paintings";

// Below this width a zoomed crop turns into a blur, as with the low-resolution fair-use files (Guernica)
const MIN_SOURCE_WIDTH = 2000;

export const hasDetailQuality = (image: PaintingImage | null): image is PaintingImage =>
  Boolean(image?.width && image.width >= MIN_SOURCE_WIDTH);

// A zoomed crop of the painting itself: cropping is the point here, unlike the full view next to it
export function PaintingDetail({ image, className }: { image: PaintingImage; className?: string }) {
  return (
    <figure className={cn("md:flex md:min-h-0 md:flex-col md:justify-end", className)}>
      {/* The frame keeps its 3:4 ratio when there is room and gives up height when the hero runs short */}
      <ImageReveal
        trigger="load"
        delay={0.35}
        parallax={6}
        className="relative aspect-3/4 bg-paper-deep md:min-h-0 md:flex-auto"
        innerClassName="absolute inset-0"
      >
        <PaintingCoverImage
          image={image}
          sizes="(min-width: 1024px) 40vw, (min-width: 640px) 60vw, 100vw"
          className="scale-180"
        />
      </ImageReveal>
      <figcaption className="mt-3 text-small text-ink-muted">Détail</figcaption>
    </figure>
  );
}
