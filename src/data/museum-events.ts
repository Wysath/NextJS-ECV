import type { Artwork } from "@/data/featured-artworks";

// Recurring programme formats rather than dated events, so the home page never lists a past date.
// Images are public domain (CC0) works from the Met Open Access collection, checked against its API.

export type MuseumEvent = {
  slug: string;
  title: string;
  schedule: string;
  description: string;
  artwork: Artwork;
};

const CRD = "https://images.metmuseum.org/CRDImages/ep/original";

export const museumEvents: MuseumEvent[] = [
  {
    slug: "nocturnes",
    title: "Nocturnes",
    // Same late opening as siteConfig.hours
    schedule: "Vendredi et samedi, jusqu’à 21h",
    description:
      "Les galeries de peinture restent ouvertes en soirée : une autre lumière sur les toiles, et moins de monde devant elles.",
    artwork: {
      id: 437853,
      title: "Venise, vue du porche de la Salute",
      artist: "Joseph Mallord William Turner",
      date: "vers 1835",
      src: `${CRD}/DP169568.jpg`,
    },
  },
  {
    slug: "visite-guidee",
    title: "Visite guidée",
    schedule: "Chaque jour d’ouverture, 11h et 15h",
    description:
      "Une heure devant une dizaine de chefs-d’œuvre, de Vermeer à Van Gogh, en compagnie d’un médiateur du musée.",
    artwork: {
      id: 436535,
      title: "Champ de blé avec cyprès",
      artist: "Vincent van Gogh",
      date: "1889",
      src: `${CRD}/DP-42549-001.jpg`,
    },
  },
  {
    slug: "croquis-en-famille",
    title: "Croquis en famille",
    schedule: "Samedi, 10h30",
    description:
      "Carnets et crayons fournis : enfants et parents dessinent devant les tableaux, guidés par un artiste. Dès 6 ans.",
    artwork: {
      id: 438817,
      title: "La Classe de danse",
      artist: "Edgar Degas",
      date: "1874",
      src: `${CRD}/DP-20101-001.jpg`,
    },
  },
];
