import "server-only";
import { imageSize } from "image-size";
import { cache } from "react";
import { NOTICE_TRANSLATIONS } from "@/data/translations/notices";
import { PAINTING_TRANSLATIONS } from "@/data/translations/paintings";
import type { Painting, PaintingImage } from "@/lib/paintings";
import { isWikimediaUrl } from "@/lib/wikimedia";

const API_URL = "https://api-museum.vercel.app";

// The collection rarely changes: pages are prerendered and refreshed at most hourly (ISR)
const REVALIDATE_SECONDS = 3600;
const IMAGE_METADATA_REVALIDATE_SECONDS = 86_400;

// Wikimedia throttles or rejects clients without a descriptive User-Agent
const USER_AGENT = "TheMetStudentProject/1.0 (Next.js)";

const WIKIMEDIA_TITLES_PER_REQUEST = 50;
const WIKIMEDIA_MAX_RETRIES = 3;

type ApiPainting = {
  id: number;
  slug: string;
  title: string;
  year?: number;
  type?: string;
  description?: string;
  image?: string;
  gallery?: string[];
  artist?: string;
  location?: string;
  locationLink?: string;
  movement?: string;
  color?: string;
};

type ApiListResponse = {
  objects: ApiPainting[];
};

type ImageInfoResponse = {
  query?: {
    normalized?: Array<{ from: string; to: string }>;
    pages?: Array<{
      title: string;
      missing?: boolean;
      imageinfo?: Array<{ width: number; height: number; url: string }>;
    }>;
  };
};

type WikimediaFile = { url: string; apiHost: string; title: string };

type ResolvedImages = Map<string, PaintingImage | null>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchApi<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["paintings"] },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Museum API ${path} answered ${response.status}`);
  return (await response.json()) as T;
}

function isImageUrl(url: string) {
  try {
    return /\.(jpe?g|png|webp|gif)$/i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

const imageUrlsOf = (urls: Array<string | undefined>) =>
  urls.filter((url): url is string => url !== undefined && isImageUrl(url));

// The API links thumbnails at arbitrary widths (2560px, 2880px) that Wikimedia refuses to generate,
// so paintings are stored by their original file and resized later by the WikimediaImage loader
const toOriginalWikimediaUrl = (url: string) =>
  url.includes("/thumb/") ? url.replace("/thumb/", "/").replace(/\/[^/]+$/, "") : url;

// Without metadata, the thumbnail width linked by the API tells how wide the original is at least.
// A link to the original file itself gives no hint, so it is served as is rather than risking missing thumbnails.
function fallbackWikimediaImage(url: string): PaintingImage {
  const linkedWidth = url.match(/\/(\d+)px-[^/]+$/)?.[1];
  return { src: toOriginalWikimediaUrl(url), minOriginalWidth: linkedWidth ? Number(linkedWidth) + 1 : 0 };
}

function parseWikimediaFile(url: string): WikimediaFile | null {
  // /wikipedia/<project>/[thumb/]<h1>/<h2>/<file>[/<width>px-<file>]
  const [, , project, ...rest] = new URL(url).pathname.split("/");
  const [, , fileName] = rest[0] === "thumb" ? rest.slice(1) : rest;
  if (!project || !fileName) return null;

  return {
    url,
    apiHost: project === "commons" ? "commons.wikimedia.org" : `${project}.wikipedia.org`,
    title: `File:${decodeURIComponent(fileName).replaceAll("_", " ")}`,
  };
}

// Wikimedia asks API clients to back off when throttled, honoring Retry-After
async function fetchWikimediaApi(url: string) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: IMAGE_METADATA_REVALIDATE_SECONDS },
    });
    if (response.status !== 429 || attempt >= WIKIMEDIA_MAX_RETRIES) return response;

    const retryAfterSeconds = Number(response.headers.get("retry-after"));
    await sleep((retryAfterSeconds > 0 ? Math.min(retryAfterSeconds, 10) : 2 ** attempt) * 1000);
  }
}

async function resolveWikimediaBatch(apiHost: string, files: WikimediaFile[], resolved: ResolvedImages) {
  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      prop: "imageinfo",
      iiprop: "size|url",
      titles: files.map((file) => file.title).join("|"),
    });
    const response = await fetchWikimediaApi(`https://${apiHost}/w/api.php?${params}`);
    if (!response.ok) throw new Error(`Wikimedia API answered ${response.status}`);

    const { query } = (await response.json()) as ImageInfoResponse;
    const normalizedTitles = new Map(query?.normalized?.map(({ from, to }) => [from, to]));
    const pages = new Map(query?.pages?.map((page) => [page.title, page]));

    for (const file of files) {
      const page = pages.get(normalizedTitles.get(file.title) ?? file.title);
      const info = page?.imageinfo?.[0];
      if (page?.missing) resolved.set(file.url, null);
      else if (info) resolved.set(file.url, { src: info.url.split("?")[0], width: info.width, height: info.height });
      else resolved.set(file.url, fallbackWikimediaImage(file.url));
    }
  } catch (error) {
    // Degraded but usable: images still render, cropped to a fixed ratio
    console.warn(error);
    for (const file of files) resolved.set(file.url, fallbackWikimediaImage(file.url));
  }
}

// One API call returns the original size of up to 50 files: nothing is downloaded, so the server
// never hits the thumbnail rate limits, and deleted files come back flagged as missing.
async function resolveWikimediaImages(urls: string[], resolved: ResolvedImages) {
  const filesByHost = new Map<string, WikimediaFile[]>();
  for (const url of urls) {
    const file = parseWikimediaFile(url);
    if (file) filesByHost.set(file.apiHost, [...(filesByHost.get(file.apiHost) ?? []), file]);
    else resolved.set(url, fallbackWikimediaImage(url));
  }

  // Sequential on purpose: Wikimedia asks API clients not to send requests in parallel
  for (const [apiHost, files] of filesByHost) {
    for (let start = 0; start < files.length; start += WIKIMEDIA_TITLES_PER_REQUEST) {
      await resolveWikimediaBatch(apiHost, files.slice(start, start + WIKIMEDIA_TITLES_PER_REQUEST), resolved);
    }
  }
}

// Other hosts have no metadata API: the size is read from the file header with a small range request
async function probeImage(src: string): Promise<PaintingImage | null> {
  for (const lastByte of [65_535, 524_287]) {
    try {
      const response = await fetch(src, {
        headers: { Range: `bytes=0-${lastByte}`, "User-Agent": USER_AGENT },
        next: { revalidate: IMAGE_METADATA_REVALIDATE_SECONDS },
      });
      if (response.status === 404 || response.status === 410) return null;
      if (!response.ok) return { src };

      const { width, height, orientation } = imageSize(new Uint8Array(await response.arrayBuffer()));
      // EXIF orientations 5 to 8 are rotated by 90 degrees
      const isRotated = orientation !== undefined && orientation >= 5;
      return isRotated ? { src, width: height, height: width } : { src, width, height };
    } catch {
      // The size marker was not in this chunk: try again with a bigger one
    }
  }
  return { src };
}

async function resolveImages(urls: string[]): Promise<ResolvedImages> {
  // Sorted so the Wikimedia requests keep the same URLs, which lets the Next.js data cache reuse them
  const uniqueUrls = [...new Set(urls)].sort();
  const resolved: ResolvedImages = new Map();

  await Promise.all([
    resolveWikimediaImages(uniqueUrls.filter(isWikimediaUrl), resolved),
    ...uniqueUrls
      .filter((url) => !isWikimediaUrl(url))
      .map(async (url) => resolved.set(url, await probeImage(url))),
  ]);
  return resolved;
}

function toPainting(raw: ApiPainting, images: ResolvedImages, { withGallery }: { withGallery: boolean }): Painting {
  const image = raw.image ? (images.get(raw.image) ?? null) : null;

  // Some gallery entries are museum web pages rather than images, and the first one often repeats the main image
  const seen = new Set(image ? [image.src] : []);
  const gallery = withGallery
    ? (raw.gallery ?? []).flatMap((url) => {
        const galleryImage = images.get(url);
        if (!galleryImage || seen.has(galleryImage.src)) return [];
        seen.add(galleryImage.src);
        return [galleryImage];
      })
    : [];

  const translation = PAINTING_TRANSLATIONS[raw.slug];

  return {
    id: raw.id,
    slug: raw.slug,
    title: translation?.title ?? raw.title,
    originalTitle: raw.title,
    year: raw.year ?? null,
    type: raw.type ?? null,
    description: NOTICE_TRANSLATIONS[raw.slug] ?? raw.description ?? null,
    image,
    gallery,
    artist: translation?.artist ?? raw.artist ?? null,
    location: translation?.location ?? raw.location ?? null,
    locationLink: raw.locationLink ?? null,
    movement: raw.movement ?? null,
    color: raw.color ?? null,
  };
}

// The list already carries every gallery, so the images of the whole collection are resolved once and
// shared by all pages. Resolving them per painting fired dozens of parallel Wikimedia calls at build (429).
const getCollection = cache(async () => {
  const data = await fetchApi<ApiListResponse>("/objects?limit=100");
  if (!data) throw new Error("Museum API: painting list not found");

  const images = await resolveImages(imageUrlsOf(data.objects.flatMap((raw) => [raw.image, ...(raw.gallery ?? [])])));
  return { objects: data.objects, images };
});

// cache() dedupes calls within one render, e.g. generateMetadata and the page asking for the same data
export const getPaintings = cache(async (): Promise<Painting[]> => {
  const { objects, images } = await getCollection();
  return objects.map((raw) => toPainting(raw, images, { withGallery: false }));
});

export const getPainting = cache(async (slug: string): Promise<Painting | null> => {
  const [raw, { images }] = await Promise.all([
    fetchApi<ApiPainting>(`/objects/${encodeURIComponent(slug)}`),
    getCollection(),
  ]);
  if (!raw) return null;

  // A painting published after the collection was cached is not in the shared index yet
  const missingUrls = imageUrlsOf([raw.image, ...(raw.gallery ?? [])]).filter((url) => !images.has(url));
  const allImages = missingUrls.length > 0 ? new Map([...images, ...(await resolveImages(missingUrls))]) : images;
  return toPainting(raw, allImages, { withGallery: true });
});
