// Hand-picked public domain (CC0) works from the Met Open Access collection, used as
// backdrops outside the painting catalogue, which comes from the museum API.

export type Artwork = {
  id: number;
  title: string;
  artist: string;
  date: string;
  src: string;
};

const CRD = "https://images.metmuseum.org/CRDImages/ep/original";

export const museumArtwork: Artwork = {
  id: 436105,
  title: "La Mort de Socrate",
  artist: "Jacques Louis David",
  date: "1787",
  src: `${CRD}/DP-13139-001.jpg`,
};

export const aboutArtwork: Artwork = {
  id: 437397,
  title: "Autoportrait",
  artist: "Rembrandt",
  date: "1660",
  src: `${CRD}/DP-16323-001.jpg`,
};

export const authArtwork: Artwork = {
  id: 437881,
  title: "Jeune Femme à l’aiguière",
  artist: "Johannes Vermeer",
  date: "vers 1662",
  src: `${CRD}/DP353257.jpg`,
};
