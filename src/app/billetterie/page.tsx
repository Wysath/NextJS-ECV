import type { Metadata } from "next";
import { connection } from "next/server";
import { TicketForm } from "@/components/tickets/TicketForm";
import { PageHero } from "@/components/ui/PageHero";
import { getBirthDateBounds, getBookingRange } from "@/lib/visit-dates";

export const metadata: Metadata = {
  title: "Billetterie",
  description:
    "Réservez vos billets pour le Metropolitan Museum of Art : tarifs, réductions, audioguide et guide papier.",
  alternates: { canonical: "/billetterie" },
};

export default async function TicketingPage() {
  // Rendered per request (SSR): a prerendered page would keep offering the days available at build time
  await connection();
  const now = new Date();

  return (
    <>
      <PageHero
        title="Réserver votre visite"
        intro="Choisissez une date, vos billets et vos options : le total se met à jour à chaque ajout."
      />
      <TicketForm bookingRange={getBookingRange(now)} birthDateBounds={getBirthDateBounds(now)} />
    </>
  );
}
