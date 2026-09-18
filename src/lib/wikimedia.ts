import type { PaintingImage } from "@/lib/paintings";

// Wikimedia only generates thumbnails at these widths: any other width answers 400
const THUMB_WIDTHS = [120, 250, 330, 500, 960, 1280, 1920, 3840];

export const isWikimediaUrl = (url: string) => url.startsWith("https://upload.wikimedia.org/wikipedia/");

// https://upload.wikimedia.org/wikipedia/commons/e/ea/File.jpg
// becomes https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/File.jpg/960px-File.jpg
export function getWikimediaThumbUrl(originalUrl: string, width: number, originalWidth = Number.POSITIVE_INFINITY) {
  const thumbWidth = THUMB_WIDTHS.find((candidate) => candidate >= width) ?? THUMB_WIDTHS[THUMB_WIDTHS.length - 1];

  // A thumbnail cannot be wider than its source, so small originals are served as is.
  // The query string keeps each URL distinct from src, which next/image expects from a loader.
  if (thumbWidth >= originalWidth) return `${originalUrl}?w=${width}`;

  const segments = new URL(originalUrl).pathname.split("/");
  const fileName = segments[segments.length - 1];
  const thumbPath = [...segments.slice(0, 3), "thumb", ...segments.slice(3)].join("/");
  return `https://upload.wikimedia.org${thumbPath}/${thumbWidth}px-${fileName}`;
}

// Social crawlers should get a thumbnail, not a 90 MB original
export const getShareImageUrl = ({ src, width }: PaintingImage) =>
  isWikimediaUrl(src) ? getWikimediaThumbUrl(src, 1280, width) : src;
