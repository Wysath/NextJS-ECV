// Curated themes: the API has no subject field, so these groupings are an editorial layer kept in the code.
// Slugs missing from the API are simply ignored, and a painting may belong to several themes.

export type Theme = {
  slug: string;
  label: string;
  description: string;
  paintings: readonly string[];
};

export const THEMES: readonly Theme[] = [
  {
    slug: "portraits",
    label: "Portraits",
    description: "Visages célèbres, regards énigmatiques et portraits de groupe qui fixent une époque.",
    paintings: [
      "mona-lisa",
      "the-arnolfini-portrait",
      "las-meninas",
      "the-night-watch",
      "american-gothic",
      "whistlers-mother",
      "girl-with-a-pearl-earring",
      "the-anatomy-lesson-of-dr-nicolaes-tulp",
    ],
  },
  {
    slug: "paysages-et-nature",
    label: "Paysages et nature",
    description: "Ciels tourmentés, mers déchaînées et jardins en fleurs, la nature vue par les peintres.",
    paintings: [
      "starry-night",
      "the-great-wave-off-kanagawa",
      "water-lilies",
      "impression-sunrise",
      "sunflowers",
      "the-hay-wain",
      "wanderer-above-the-sea-of-fog",
      "the-fighting-temeraire",
    ],
  },
  {
    slug: "scenes-de-la-vie",
    label: "Scènes de la vie",
    description: "Bals, terrasses et gestes du quotidien, quand la peinture observe ses contemporains.",
    paintings: [
      "a-sunday-afternoon-on-the-island-of-la-grande-jatte",
      "the-milkmaid",
      "nighthawks",
      "cafe-terrace-at-night",
      "dance-at-the-moulin-de-la-galette",
      "the-swing",
    ],
  },
  {
    slug: "mythes-et-croyances",
    label: "Mythes et croyances",
    description: "Dieux antiques, récits bibliques et héritage des philosophes, les grands récits fondateurs.",
    paintings: [
      "the-birth-of-venus",
      "the-creation-of-adam",
      "the-last-supper",
      "the-school-of-athens",
      "the-garden-of-earthly-delights",
      "saturn-devouring-his-son",
    ],
  },
  {
    slug: "histoire",
    label: "L’Histoire en marche",
    description: "Révolutions, naufrages et guerres, des toiles qui ont témoigné de leur temps.",
    paintings: [
      "liberty-leading-the-people",
      "the-raft-of-the-medusa",
      "the-third-of-may-1808",
      "the-death-of-marat",
      "guernica",
      "the-fighting-temeraire",
    ],
  },
  {
    slug: "corps-et-desir",
    label: "Corps et désir",
    description: "Nus, étreintes et jeux de séduction, le corps comme sujet et comme scandale.",
    paintings: [
      "the-birth-of-venus",
      "the-kiss",
      "la-grande-odalisque",
      "olympia",
      "the-swing",
      "the-creation-of-adam",
    ],
  },
  {
    slug: "reves-et-tourments",
    label: "Rêves et tourments",
    description: "Visions, cauchemars et angoisses, quand la peinture explore l’inconscient.",
    paintings: [
      "the-persistence-of-memory",
      "the-scream",
      "the-garden-of-earthly-delights",
      "saturn-devouring-his-son",
      "ophelia",
    ],
  },
];
