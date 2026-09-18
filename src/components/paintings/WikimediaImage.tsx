"use client";

import Image, { type ImageProps } from "next/image";
import { getWikimediaThumbUrl } from "@/lib/wikimedia";

type WikimediaImageProps = Omit<ImageProps, "loader" | "src"> & {
  src: string;
  originalWidth?: number;
};

// Wikimedia resizes images itself, so the browser downloads the right thumbnail straight from its CDN.
// Going through the Next.js optimizer instead got the server rate limited (429) by Wikimedia.
// A client component because a loader is a function, which cannot be passed from the server.
export function WikimediaImage({ src, originalWidth, alt, ...props }: WikimediaImageProps) {
  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      loader={({ width }) => getWikimediaThumbUrl(src, width, originalWidth)}
    />
  );
}
