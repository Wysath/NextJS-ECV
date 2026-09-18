import Image from "next/image";
import { WikimediaImage } from "@/components/paintings/WikimediaImage";
import { cn } from "@/lib/cn";
import type { PaintingImage as PaintingImageData } from "@/lib/paintings";
import { isWikimediaUrl } from "@/lib/wikimedia";

type PaintingImageProps = {
  image: PaintingImageData | null;
  alt: string;
  sizes: string;
  // "width" fills its column, "contain" keeps a tall painting inside the viewport
  fit?: "width" | "contain";
  preload?: boolean;
  className?: string;
};

export function PaintingImage({ image, alt, sizes, fit = "width", preload = false, className }: PaintingImageProps) {
  if (!image) {
    return <div aria-hidden className={cn("aspect-4/5 bg-paper-deep", className)} />;
  }

  const hasSize = Boolean(image.width && image.height);
  const layoutProps = hasSize
    ? {
        width: image.width,
        height: image.height,
        // "contain" is sized from the known dimensions, never from the file's intrinsic size: when a small original
        // is served for a wide srcset candidate, the browser divides its pixels by that width (Guernica shrank to 191px).
        // The max width also keeps a low-resolution file from being upscaled.
        style: fit === "contain" ? { maxWidth: `${image.width}px` } : undefined,
        className: cn(
          fit === "width"
            ? "h-auto w-full"
            : "mx-auto h-auto max-h-[70svh] w-full object-contain md:max-h-[calc(100svh-var(--spacing-header)-10rem)]",
          className,
        ),
      }
    : { fill: true, className: cn("object-cover", className) };
  const priorityProps = preload ? ({ loading: "eager", fetchPriority: "high" } as const) : {};

  const img = isWikimediaUrl(image.src) ? (
    <WikimediaImage
      src={image.src}
      alt={alt}
      sizes={sizes}
      originalWidth={image.width ?? image.minOriginalWidth}
      {...layoutProps}
      {...priorityProps}
    />
  ) : (
    <Image src={image.src} alt={alt} sizes={sizes} {...layoutProps} {...priorityProps} />
  );

  // Dimensions could not be read: a fixed ratio avoids layout shift, at the cost of cropping
  return hasSize ? img : <div className="relative aspect-4/5 overflow-hidden">{img}</div>;
}
