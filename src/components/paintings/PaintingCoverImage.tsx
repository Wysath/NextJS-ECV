import Image from "next/image";
import { WikimediaImage } from "@/components/paintings/WikimediaImage";
import { cn } from "@/lib/cn";
import type { PaintingImage } from "@/lib/paintings";
import { isWikimediaUrl } from "@/lib/wikimedia";

type PaintingCoverImageProps = {
  image: PaintingImage;
  sizes: string;
  className?: string;
};

// Fills a positioned parent and crops to it: for thumbnails and details, never for a painting presented whole
export function PaintingCoverImage({ image, sizes, className }: PaintingCoverImageProps) {
  const imageClassName = cn("object-cover", className);

  return isWikimediaUrl(image.src) ? (
    <WikimediaImage
      src={image.src}
      originalWidth={image.width ?? image.minOriginalWidth}
      alt=""
      fill
      sizes={sizes}
      className={imageClassName}
    />
  ) : (
    <Image src={image.src} alt="" fill sizes={sizes} className={imageClassName} />
  );
}
