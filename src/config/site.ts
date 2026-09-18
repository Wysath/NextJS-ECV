export const siteConfig = {
  name: "The Met",
  fullName: "The Metropolitan Museum of Art",
  description:
    "Explorez une sélection de chefs-d’œuvre de la peinture mondiale et préparez votre visite du Metropolitan Museum of Art.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nav: [
    { label: "Accueil", href: "/" },
    { label: "Tableaux", href: "/tableaux" },
    { label: "Billetterie", href: "/billetterie" },
    { label: "À propos", href: "/a-propos" },
  ],
  address: {
    street: "1000 Fifth Avenue",
    city: "New York, NY 10028",
    country: "États-Unis",
  },
  // schedule feeds the opening hours of the structured data, so search engines read the same hours as visitors
  hours: [
    {
      days: "Dimanche, lundi, mardi et jeudi",
      time: "10h à 17h",
      schedule: { days: ["Sunday", "Monday", "Tuesday", "Thursday"], opens: "10:00", closes: "17:00" },
    },
    {
      days: "Vendredi et samedi",
      time: "10h à 21h",
      schedule: { days: ["Friday", "Saturday"], opens: "10:00", closes: "21:00" },
    },
    { days: "Mercredi", time: "Fermé", schedule: null },
  ],
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/metmuseum" },
    { label: "Facebook", href: "https://www.facebook.com/metmuseum" },
    { label: "YouTube", href: "https://www.youtube.com/@metmuseum" },
  ],
} as const;

const ROUTE_LABELS: Record<string, string> = {
  ...Object.fromEntries(siteConfig.nav.map((item) => [item.href, item.label])),
  "/billetterie/confirmation": "Confirmation",
  "/connexion": "Connexion",
  "/inscription": "Inscription",
  "/compte": "Mon compte",
};

export function getRouteLabel(pathname: string) {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  if (pathname.startsWith("/tableaux/")) return "Tableau";
  return siteConfig.name;
}
