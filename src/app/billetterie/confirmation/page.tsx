import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DrawnStrokes } from "@/components/animation/DrawnStrokes";
import { TextReveal } from "@/components/animation/TextReveal";
import { OrderSummary } from "@/components/tickets/OrderSummary";
import { Button } from "@/components/ui/Button";
import { readOrder } from "@/lib/order";
import { computeOrder } from "@/lib/tickets";
import { formatBirthDate, formatVisitDate } from "@/lib/visit-dates";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false },
};

export default async function ConfirmationPage() {
  const order = await readOrder();
  if (!order) redirect("/billetterie");

  const dateLabel = formatVisitDate(order.date);
  const details = [
    { label: "Référence", value: order.reference },
    { label: "Date", value: dateLabel },
    { label: "Nom", value: order.lastName },
    { label: "Prénom", value: order.firstName },
    { label: "Date de naissance", value: formatBirthDate(order.birthDate) },
    { label: "E-mail", value: order.email },
  ];

  return (
    <section className="wrapper relative isolate grid gap-12 overflow-x-clip pt-16 pb-section md:pt-24 lg:grid-cols-12">
      <DrawnStrokes placements={["top-right"]} />
      <div className="lg:col-span-7">
        <TextReveal trigger="load">
          <h1 className="text-h1">À très vite au musée.</h1>
        </TextReveal>
        <p className="mt-8 max-w-prose text-lead text-ink-muted">
          Présentez votre référence à l’accueil le jour de la visite, le plan du musée vous y sera remis.
        </p>

        <dl className="mt-12 divide-y border-y">
          {details.map((detail) => (
            <div key={detail.label} className="flex justify-between gap-6 py-4">
              <dt className="text-small text-ink-muted">{detail.label}</dt>
              <dd className="min-w-0 text-right wrap-break-word">{detail.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-small text-ink-muted">
          Projet étudiant non officiel : aucune commande n’a été enregistrée et aucun e-mail envoyé.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/tableaux">Explorer les tableaux</Button>
          <Button href="/" variant="outline">
            Retour à l’accueil
          </Button>
        </div>
      </div>

      <OrderSummary
        order={computeOrder(order.quantities, order.options)}
        dateLabel={dateLabel}
        className="lg:col-span-4 lg:col-start-9"
      />
    </section>
  );
}
