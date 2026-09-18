// Shared by the form (live total) and the server (validation, confirmation):
// amounts are always recomputed from quantities, never trusted from the browser

export const TICKETS = [
  { id: "adulte", label: "Adulte", detail: "De 26 à 64 ans", price: 24, category: "standard", requiresCompanion: false },
  { id: "jeune", label: "Jeune", detail: "De 12 à 25 ans", price: 18, category: "standard", requiresCompanion: false },
  { id: "enfant", label: "Enfant", detail: "De 5 à 11 ans", price: 12, category: "standard", requiresCompanion: true },
  { id: "moins-de-5", label: "Moins de 5 ans", detail: "Entrée gratuite", price: 0, category: "standard", requiresCompanion: true },
  { id: "senior", label: "Senior", detail: "65 ans et plus", price: 18, category: "reduced", requiresCompanion: false },
  { id: "recherche-emploi", label: "Personne en recherche d’emploi", detail: "Attestation de moins de 6 mois", price: 18, category: "reduced", requiresCompanion: false },
  { id: "pmr", label: "Personne à mobilité réduite", detail: "Carte mobilité inclusion", price: 18, category: "reduced", requiresCompanion: false },
] as const;

export type TicketId = (typeof TICKETS)[number]["id"];
export type Quantities = Record<TicketId, number>;

export const VISIT_OPTIONS = [
  { id: "audioguide", label: "Audioguide", description: "Commentaires audio sur les œuvres majeures du parcours.", price: 2 },
  { id: "guide-papier", label: "Guide papier", description: "Le guide imprimé des collections, à garder après la visite.", price: 4 },
] as const;

export type VisitOptionId = (typeof VISIT_OPTIONS)[number]["id"];

export const MAX_TICKETS_PER_TYPE = 99;
export const GROUP_MIN_TICKETS = 10;
export const GROUP_PRICE = 15;

export const EMPTY_QUANTITIES = Object.fromEntries(TICKETS.map((ticket) => [ticket.id, 0])) as Quantities;

export const ticketFieldName = (id: TicketId) => `billet-${id}`;

export const clampQuantity = (value: number) =>
  Number.isFinite(value) ? Math.min(Math.max(Math.trunc(value), 0), MAX_TICKETS_PER_TYPE) : 0;

// Hand-rolled rather than Intl.NumberFormat: server and browser ICU data can disagree on the
// space before the euro sign, which would break hydration
export const formatPrice = (amount: number) => `${amount} €`;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function computeOrder(quantities: Quantities, options: readonly VisitOptionId[]) {
  const payingTickets = sum(TICKETS.map((ticket) => (ticket.price > 0 ? quantities[ticket.id] : 0)));
  const isGroup = payingTickets >= GROUP_MIN_TICKETS;

  const ticketLines = TICKETS.filter((ticket) => quantities[ticket.id] > 0).map((ticket) => {
    // The group rate never raises a price that is already lower, such as the child ticket
    const unitPrice = isGroup ? Math.min(ticket.price, GROUP_PRICE) : ticket.price;
    const quantity = quantities[ticket.id];
    return { id: ticket.id, label: ticket.label, quantity, total: unitPrice * quantity, fullTotal: ticket.price * quantity };
  });

  const visitors = sum(Object.values(quantities));
  // Toddlers do not get an audioguide or a guide of their own
  const optionHolders = visitors - quantities["moins-de-5"];
  const optionLines = VISIT_OPTIONS.filter((option) => options.includes(option.id) && optionHolders > 0).map(
    (option) => ({ id: option.id, label: option.label, quantity: optionHolders, total: option.price * optionHolders }),
  );

  const optionsTotal = sum(optionLines.map((line) => line.total));
  const total = sum(ticketLines.map((line) => line.total)) + optionsTotal;
  const fullTotal = sum(ticketLines.map((line) => line.fullTotal)) + optionsTotal;

  return { ticketLines, optionLines, visitors, optionHolders, payingTickets, isGroup, savings: fullTotal - total, total };
}

export type ComputedOrder = ReturnType<typeof computeOrder>;

export function getTicketsError(quantities: Quantities) {
  if (sum(Object.values(quantities)) === 0) return "Ajoutez au moins un billet.";
  if (TICKETS.every((ticket) => ticket.requiresCompanion || quantities[ticket.id] === 0)) {
    return "Les enfants de moins de 12 ans doivent venir accompagnés : ajoutez un autre billet.";
  }
  return null;
}

export type CheckoutField = "date" | "tickets" | "lastName" | "firstName" | "birthDate" | "email" | "consent";
export type CheckoutState = { errors?: Partial<Record<CheckoutField, string>> };
