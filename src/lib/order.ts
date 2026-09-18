import "server-only";
import { cookies } from "next/headers";
import {
  type CheckoutState,
  type Quantities,
  type TicketId,
  type VisitOptionId,
  TICKETS,
  VISIT_OPTIONS,
  clampQuantity,
  getTicketsError,
  ticketFieldName,
} from "@/lib/tickets";
import {
  type BirthDateBounds,
  type DateRange,
  isBirthDateInBounds,
  isBookableDate,
  isCalendarDate,
} from "@/lib/visit-dates";

const ORDER_COOKIE = "met-commande";
const ORDER_COOKIE_MAX_AGE = 60 * 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REFERENCE_PATTERN = /^MET-[0-9A-F]{8}$/;
const MAX_TEXT_LENGTH = 120;
const MAX_NAME_LENGTH = 60;
// At least one letter: rules out a field filled with spaces, digits or punctuation only
const NAME_PATTERN = /\p{L}/u;

export type Order = {
  reference: string;
  date: string;
  quantities: Quantities;
  options: VisitOptionId[];
  lastName: string;
  firstName: string;
  birthDate: string;
  email: string;
};

type Errors = NonNullable<CheckoutState["errors"]>;

const toQuantities = (read: (id: TicketId) => unknown) =>
  Object.fromEntries(TICKETS.map((ticket) => [ticket.id, clampQuantity(Number(read(ticket.id)))])) as Quantities;

const toOptions = (values: unknown[]) =>
  VISIT_OPTIONS.map((option) => option.id).filter((id) => values.includes(id));

const isName = (value: unknown): value is string =>
  typeof value === "string" && value.length <= MAX_NAME_LENGTH && NAME_PATTERN.test(value);

export function parseCheckoutForm(
  formData: FormData,
  bookingRange: DateRange,
  birthDateBounds: BirthDateBounds,
): { order: Order; errors?: never } | { errors: Errors } {
  const text = (key: string, maxLength = MAX_TEXT_LENGTH) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
  };

  const date = text("date");
  const lastName = text("nom", MAX_NAME_LENGTH);
  const firstName = text("prenom", MAX_NAME_LENGTH);
  const birthDate = text("naissance");
  const email = text("email");
  const quantities = toQuantities((id) => formData.get(ticketFieldName(id)));
  const errors: Errors = {};

  if (!date) errors.date = "Choisissez une date de visite.";
  else if (!isBookableDate(date, bookingRange)) errors.date = "Cette date n’est pas disponible, choisissez-en une autre.";
  const ticketsError = getTicketsError(quantities);
  if (ticketsError) errors.tickets = ticketsError;
  if (!isName(lastName)) errors.lastName = "Indiquez votre nom.";
  if (!isName(firstName)) errors.firstName = "Indiquez votre prénom.";
  if (!birthDate) errors.birthDate = "Indiquez votre date de naissance.";
  else if (!isBirthDateInBounds(birthDate, birthDateBounds)) errors.birthDate = "Cette date de naissance n’est pas valide.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Indiquez une adresse e-mail valide.";
  // Checked on the server too: the browser-side required attribute is skipped by noValidate and by crafted requests
  if (formData.get("consentement") !== "oui") errors.consent = "Cochez cette case pour valider votre réservation.";
  if (Object.keys(errors).length > 0) return { errors };

  return {
    order: {
      reference: `MET-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      date,
      quantities,
      options: toOptions(formData.getAll("options")),
      lastName,
      firstName,
      birthDate,
      email,
    },
  };
}

// No payment and no database: the order only lives in a short-lived cookie read by the confirmation page
export async function saveOrder(order: Order) {
  (await cookies()).set(ORDER_COOKIE, JSON.stringify(order), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/billetterie",
    maxAge: ORDER_COOKIE_MAX_AGE,
  });
}

// The cookie comes back from the browser, so it is checked like any other user input.
// An order saved before the contact fields changed fails this check and sends the visitor back to the form.
export async function readOrder(): Promise<Order | null> {
  const value = (await cookies()).get(ORDER_COOKIE)?.value;
  if (!value) return null;

  try {
    const raw = JSON.parse(value);
    const quantities = toQuantities((id) => raw.quantities?.[id]);
    const isValid =
      REFERENCE_PATTERN.test(raw.reference) &&
      isCalendarDate(raw.date) &&
      isName(raw.lastName) &&
      isName(raw.firstName) &&
      isCalendarDate(raw.birthDate) &&
      EMAIL_PATTERN.test(raw.email) &&
      getTicketsError(quantities) === null;
    if (!isValid) return null;

    return {
      reference: raw.reference,
      date: raw.date,
      quantities,
      options: toOptions(Array.isArray(raw.options) ? raw.options : []),
      lastName: raw.lastName,
      firstName: raw.firstName,
      birthDate: raw.birthDate,
      email: raw.email,
    };
  } catch {
    return null;
  }
}
