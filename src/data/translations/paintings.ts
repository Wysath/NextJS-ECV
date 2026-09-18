// The museum API only speaks English for titles, some artist names and locations. Keyed by slug and applied when
// the API data is mapped, so a painting added to the API later still shows, in English, until it is translated here.

export type PaintingTranslation = {
  title: string;
  location: string;
  // Only where French uses its own form of the name
  artist?: string;
};

const MOMA = "Museum of Modern Art (MoMA), New York";
const LOUVRE = "Musée du Louvre, Paris";
const NATIONAL_GALLERY = "National Gallery, Londres";
const PRADO = "Musée du Prado, Madrid";
const ORSAY = "Musée d’Orsay, Paris";
const CHICAGO = "Art Institute of Chicago, Chicago";
const RIJKSMUSEUM = "Rijksmuseum, Amsterdam";
const MAURITSHUIS = "Mauritshuis, La Haye";

export const PAINTING_TRANSLATIONS: Record<string, PaintingTranslation> = {
  "starry-night": { title: "La Nuit étoilée", location: MOMA },
  "mona-lisa": { title: "La Joconde", artist: "Léonard de Vinci", location: LOUVRE },
  // Keeps "Metropolitan Museum of Art": the painting page detects the Met from it
  "the-great-wave-off-kanagawa": {
    title: "La Grande Vague de Kanagawa",
    location: "Metropolitan Museum of Art, New York (plusieurs exemplaires existent)",
  },
  "the-birth-of-venus": { title: "La Naissance de Vénus", location: "Galerie des Offices, Florence" },
  "the-persistence-of-memory": { title: "La Persistance de la mémoire", location: MOMA },
  "the-arnolfini-portrait": { title: "Les Époux Arnolfini", location: NATIONAL_GALLERY },
  "a-sunday-afternoon-on-the-island-of-la-grande-jatte": {
    title: "Un dimanche après-midi à l’île de la Grande Jatte",
    location: CHICAGO,
  },
  "las-meninas": { title: "Les Ménines", location: PRADO },
  "the-night-watch": { title: "La Ronde de nuit", location: RIJKSMUSEUM },
  // Known in French under its English title
  "american-gothic": { title: "American Gothic", location: CHICAGO },
  "the-kiss": { title: "Le Baiser", location: "Galerie du Belvédère, Vienne" },
  "water-lilies": { title: "Les Nymphéas", location: "Plusieurs musées dans le monde" },
  "the-scream": { title: "Le Cri", location: "Galerie nationale de Norvège, Oslo" },
  guernica: { title: "Guernica", location: "Musée Reina Sofía, Madrid" },
  "the-creation-of-adam": { title: "La Création d’Adam", artist: "Michel-Ange", location: "Chapelle Sixtine, Cité du Vatican" },
  "impression-sunrise": { title: "Impression, soleil levant", location: "Musée Marmottan Monet, Paris" },
  nighthawks: { title: "Les Noctambules", location: CHICAGO },
  "the-garden-of-earthly-delights": { title: "Le Jardin des délices", artist: "Jérôme Bosch", location: PRADO },
  "liberty-leading-the-people": { title: "La Liberté guidant le peuple", location: LOUVRE },
  "the-milkmaid": { title: "La Laitière", location: RIJKSMUSEUM },
  "cafe-terrace-at-night": { title: "Terrasse du café le soir", location: "Musée Kröller-Müller, Pays-Bas" },
  "the-school-of-athens": {
    title: "L’École d’Athènes",
    artist: "Raphaël",
    location: "Palais apostolique, Cité du Vatican",
  },
  "dance-at-the-moulin-de-la-galette": { title: "Bal du moulin de la Galette", location: ORSAY },
  "the-swing": { title: "L’Escarpolette", location: "Wallace Collection, Londres" },
  "whistlers-mother": { title: "La Mère de Whistler", location: ORSAY },
  "the-last-supper": { title: "La Cène", artist: "Léonard de Vinci", location: "Santa Maria delle Grazie, Milan" },
  "the-raft-of-the-medusa": { title: "Le Radeau de La Méduse", location: LOUVRE },
  sunflowers: { title: "Les Tournesols", location: NATIONAL_GALLERY },
  "the-hay-wain": { title: "La Charrette de foin", location: NATIONAL_GALLERY },
  ophelia: { title: "Ophélie", location: "Tate Britain, Londres" },
  "girl-with-a-pearl-earring": { title: "La Jeune Fille à la perle", location: MAURITSHUIS },
  "the-third-of-may-1808": { title: "Le 3 mai 1808", location: PRADO },
  "saturn-devouring-his-son": { title: "Saturne dévorant un de ses fils", location: PRADO },
  "wanderer-above-the-sea-of-fog": {
    title: "Le Voyageur contemplant une mer de nuages",
    location: "Kunsthalle de Hambourg, Hambourg",
  },
  "the-death-of-marat": {
    title: "La Mort de Marat",
    location: "Musées royaux des Beaux-Arts de Belgique, Bruxelles",
  },
  "la-grande-odalisque": { title: "La Grande Odalisque", location: LOUVRE },
  olympia: { title: "Olympia", location: ORSAY },
  "the-fighting-temeraire": { title: "Le Dernier Voyage du Téméraire", location: NATIONAL_GALLERY },
  "the-anatomy-lesson-of-dr-nicolaes-tulp": { title: "La Leçon d’anatomie du docteur Tulp", location: MAURITSHUIS },
};
