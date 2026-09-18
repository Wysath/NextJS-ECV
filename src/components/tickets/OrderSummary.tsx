import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { type ComputedOrder, formatPrice } from "@/lib/tickets";

// No "use client": rendered live inside the ticketing form, and as a plain server component on the confirmation page
type OrderSummaryProps = {
  order: ComputedOrder;
  dateLabel: string | null;
  id?: string;
  className?: string;
  children?: ReactNode;
};

export function OrderSummary({ order, dateLabel, id, className, children }: OrderSummaryProps) {
  return (
    <aside
      id={id}
      aria-labelledby="order-summary-title"
      className={cn("scroll-mt-[calc(var(--spacing-header)+1rem)] lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start", className)}
    >
      <div className="bg-paper-deep p-6 md:p-8">
        <h2 id="order-summary-title" className="eyebrow text-accent">
          Récapitulatif
        </h2>
        <p className={cn("type-label mt-4", !dateLabel && "text-ink-muted")}>
          {dateLabel ?? "Date de visite à choisir"}
        </p>

        {order.visitors === 0 ? (
          <p className="mt-6 border-t border-line pt-6 text-small text-ink-muted">Aucun billet pour le moment.</p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {order.ticketLines.map((line) => (
              <li key={line.id} className="flex items-baseline justify-between gap-4 py-3">
                <span>
                  {line.quantity} × {line.label}
                </span>
                <span className="shrink-0 text-right tabular-nums">
                  {line.fullTotal !== line.total && (
                    <s className="mr-2 text-small text-ink-muted">{formatPrice(line.fullTotal)}</s>
                  )}
                  {formatPrice(line.total)}
                </span>
              </li>
            ))}
            {order.optionLines.map((line) => (
              <li key={line.id} className="flex items-baseline justify-between gap-4 py-3">
                <span>
                  {line.label} × {line.quantity}
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(line.total)}</span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 py-3 text-ink-muted">
              <span>Plan du musée</span>
              <span className="shrink-0">Offert</span>
            </li>
          </ul>
        )}

        {order.savings > 0 && (
          <p className="mt-4 text-small text-accent">
            Tarif groupe appliqué : {formatPrice(order.savings)} d’économie.
          </p>
        )}

        <div className="mt-6 flex items-baseline justify-between gap-4">
          <span className="font-medium">Total</span>
          <p aria-live="polite" aria-atomic className="type-numeral text-h2">
            <span className="sr-only">Total : </span>
            {formatPrice(order.total)}
          </p>
        </div>

        {children}
      </div>
    </aside>
  );
}
