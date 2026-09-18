import { siteConfig } from "@/config/site";
import type { Painting } from "@/lib/paintings";
import { getExcerpt, getTypeLabel } from "@/lib/paintings";
import { getShareImageUrl } from "@/lib/wikimedia";

// JSON-LD describes the pages to search engines in their own vocabulary (schema.org), which the meta tags cannot do:
// a museum with its address and hours, a painting with its artist and year.

const absolute = (path: string) => `${siteConfig.url}${path}`;

export function getMuseumSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Museum",
    "@id": absolute("/#museum"),
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    sameAs: siteConfig.socials.map((social) => social.href),
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10028",
      addressCountry: "US",
    },
    openingHoursSpecification: siteConfig.hours.flatMap((slot) =>
      slot.schedule
        ? [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: slot.schedule.days,
              opens: slot.schedule.opens,
              closes: slot.schedule.closes,
            },
          ]
        : [],
    ),
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absolute("/#website"),
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "fr-FR",
    publisher: { "@id": absolute("/#museum") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absolute("/tableaux?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getPaintingSchema(painting: Painting) {
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: painting.title,
    alternateName: painting.originalTitle !== painting.title ? painting.originalTitle : undefined,
    url: absolute(`/tableaux/${painting.slug}`),
    image: painting.image ? getShareImageUrl(painting.image) : undefined,
    description: painting.description ? getExcerpt(painting.description, 300) : undefined,
    creator: painting.artist ? { "@type": "Person", name: painting.artist } : undefined,
    dateCreated: painting.year?.toString(),
    artform: getTypeLabel(painting.type) ?? undefined,
    // The museum holding the work, which is rarely this one: the catalogue covers the great museums of the world
    contentLocation: painting.location ? { "@type": "Place", name: painting.location } : undefined,
    isPartOf: { "@id": absolute("/#website") },
  };
}

export function getBreadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: absolute(step.path),
    })),
  };
}
