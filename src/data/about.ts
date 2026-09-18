import type { Artwork } from "@/data/featured-artworks";

// Dates and figures checked against the Met's history page and its 2017 Open Access press release.
// Images are public domain (CC0) works from the Met Open Access collection, checked against its API.

export type Milestone = {
  year: string;
  title: string;
  text: string;
};

export type Department = {
  name: string;
  artwork: Artwork;
};

export type Site = {
  name: string;
  location: string;
  text: string;
  artwork: Artwork;
};

const CRD = "https://images.metmuseum.org/CRDImages";

export const milestones: Milestone[] = [
  {
    year: "1870",
    title: "La fondation",
    text: "Le 13 avril, un groupe de citoyens, d’artistes et de mécènes new-yorkais obtient la création du musée. Il ouvre au public en 1872, dans le Dodworth Building, au 681 Cinquième Avenue.",
  },
  {
    year: "1880",
    title: "L’installation à Central Park",
    text: "Le 30 mars, le musée ouvre sur son site actuel, à hauteur de la 82e rue, dans un bâtiment néogothique de Calvert Vaux et Jacob Wrey Mould. Sa façade de brique reste visible dans l’aile Robert Lehman.",
  },
  {
    year: "1902",
    title: "La façade Beaux-Arts",
    text: "En décembre ouvrent la façade sur la Cinquième Avenue et le Grand Hall, dessinés par Richard Morris Hunt, architecte et administrateur fondateur du musée.",
  },
  {
    year: "1938",
    title: "The Cloisters",
    text: "Le 10 mai, le Met inaugure au nord de Manhattan un second site consacré à l’Europe médiévale, dans le parc de Fort Tryon offert à la ville par John D. Rockefeller Jr.",
  },
  {
    year: "1978",
    title: "Le temple de Dendour",
    text: "Offert par l’Égypte aux États-Unis, le temple antique est remonté pierre à pierre dans une aile vitrée ouverte sur Central Park.",
  },
  {
    year: "2017",
    title: "L’Open Access",
    text: "Plus de 375 000 images d’œuvres du domaine public deviennent libres de droits, réutilisables par tous sans restriction.",
  },
];

export const departments: Department[] = [
  {
    name: "Art égyptien",
    artwork: {
      id: 544740,
      title: "Yuny et son épouse Renenutet",
      artist: "Égypte, Nouvel Empire",
      date: "vers 1299-1290 av. J.-C.",
      src: `${CRD}/eg/original/DT549.jpg`,
    },
  },
  {
    name: "Art grec et romain",
    artwork: {
      id: 253370,
      title: "Kouros en marbre",
      artist: "Grèce, Attique",
      date: "vers 590-580 av. J.-C.",
      src: `${CRD}/gr/original/DP-23263-005.jpg`,
    },
  },
  {
    name: "Art asiatique",
    artwork: {
      id: 45434,
      title: "Sous la vague au large de Kanagawa",
      artist: "Katsushika Hokusai",
      date: "vers 1830-1832",
      src: `${CRD}/as/original/DP130155.jpg`,
    },
  },
  {
    name: "Peintures européennes",
    artwork: {
      id: 436532,
      title: "Autoportrait au chapeau de paille",
      artist: "Vincent van Gogh",
      date: "1887",
      src: `${CRD}/ep/original/DT1502_cropped2.jpg`,
    },
  },
  {
    name: "Aile américaine",
    artwork: {
      id: 11417,
      title: "Washington traversant le Delaware",
      artist: "Emanuel Leutze",
      date: "1851",
      src: `${CRD}/ad/original/DP215410.jpg`,
    },
  },
  {
    name: "Armes et armures",
    artwork: {
      id: 22270,
      title: "Armure",
      artist: "Europe",
      date: "vers 1560-1565",
      src: `${CRD}/aa/original/DP-36242-003.jpg`,
    },
  },
];

export const sites: Site[] = [
  {
    name: "The Met Fifth Avenue",
    location: "1000 Fifth Avenue, en bordure de Central Park",
    text: "Le bâtiment principal : environ 190 000 m² où se côtoient les pharaons, la Renaissance, l’Asie, les Amériques et l’art moderne.",
    artwork: {
      id: 547802,
      title: "Le temple de Dendour",
      artist: "Égypte, période romaine",
      date: "achevé vers 10 av. J.-C.",
      src: `${CRD}/eg/original/DP240337.jpg`,
    },
  },
  {
    name: "The Met Cloisters",
    location: "Fort Tryon Park, au nord de Manhattan",
    text: "Art et architecture de l’Europe médiévale, présentés dans des cloîtres et des jardins bâtis avec des éléments d’abbayes françaises.",
    artwork: {
      id: 467642,
      title: "La Licorne captive",
      artist: "Tapisseries de la Licorne",
      date: "1495-1505",
      src: `${CRD}/cl/original/DP118991.jpg`,
    },
  },
];
