"use client";

import { type ReactNode, startTransition, useActionState, useState } from "react";
import { checkout } from "@/app/billetterie/actions";
import { OrderSummary } from "@/components/tickets/OrderSummary";
import { QuantityInput } from "@/components/tickets/QuantityInput";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  type CheckoutState,
  type TicketId,
  type VisitOptionId,
  EMPTY_QUANTITIES,
  GROUP_MIN_TICKETS,
  GROUP_PRICE,
  TICKETS,
  VISIT_OPTIONS,
  computeOrder,
  formatPrice,
  getTicketsError,
  ticketFieldName,
} from "@/lib/tickets";
import { type BirthDateBounds, type DateRange, formatVisitDate } from "@/lib/visit-dates";
import { VisitCalendar } from "@/components/tickets/VisitCalendar";

const INITIAL_STATE: CheckoutState = {};

// Hint shown only once a group is within reach, to avoid noise on small orders
const GROUP_HINT_THRESHOLD = 5;

const TICKET_SECTIONS = [
  { title: "Tarifs", tickets: TICKETS.filter((ticket) => ticket.category === "standard") },
  { title: "Tarifs réduits, sur justificatif", tickets: TICKETS.filter((ticket) => ticket.category === "reduced") },
];

const inputClasses =
  "mt-2 h-12 w-full border-b border-ink/30 bg-transparent text-lead transition-colors focus:border-ink focus-visible:outline-offset-4 aria-invalid:border-accent";

type TicketFormProps = {
  bookingRange: DateRange;
  birthDateBounds: BirthDateBounds;
};

export function TicketForm({ bookingRange, birthDateBounds }: TicketFormProps) {
  const [state, formAction, isPending] = useActionState(checkout, INITIAL_STATE);
  // Everything is controlled: React resets uncontrolled fields after an action, which would wipe the form on a validation error
  const [date, setDate] = useState("");
  const [quantities, setQuantities] = useState(EMPTY_QUANTITIES);
  const [options, setOptions] = useState<VisitOptionId[]>([]);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);

  const order = computeOrder(quantities, options);
  const errors = state.errors ?? {};
  // A server error stays relevant only until the visitor fixes the quantities
  const ticketsError = errors.tickets ? getTicketsError(quantities) : null;
  const ticketsToGroup = GROUP_MIN_TICKETS - order.payingTickets;

  const setQuantity = (id: TicketId, value: number) => setQuantities((current) => ({ ...current, [id]: value }));
  const toggleOption = (id: VisitOptionId, checked: boolean) =>
    setOptions((current) => (checked ? [...current, id] : current.filter((option) => option !== id)));

  return (
    <form
      // Kept for submissions without JavaScript
      action={formAction}
      // React resets a form after its action runs, which unchecks the DOM radios and checkboxes while their
      // controlled state stays unchanged, so the next submission would miss them. Dispatching by hand skips that reset.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      noValidate
      // grid-cols-1 is minmax(0, 1fr): an auto column would grow to fit its widest content on mobile
      className="wrapper grid grid-cols-1 gap-12 pb-section lg:grid-cols-12"
    >
      <div className="flex flex-col gap-16 lg:col-span-7">
        <Step number="01" title="Date de visite" error={errors.date} errorId="date-error">
          <p className="text-small text-ink-muted">
            Réservation jusqu’à un an à l’avance. Le musée est fermé le mercredi.
          </p>
          <VisitCalendar
            value={date}
            onChange={setDate}
            range={bookingRange}
            describedBy={errors.date ? "date-error" : undefined}
          />
        </Step>

        <Step number="02" title="Billets" error={ticketsError} errorId="tickets-error">
          <p className="text-small text-ink-muted">
            Tarif groupe automatique dès {GROUP_MIN_TICKETS} billets payants : {formatPrice(GROUP_PRICE)} par
            personne.
          </p>
          {TICKET_SECTIONS.map((section) => (
            <div key={section.title} className="mt-8">
              <h3 className="eyebrow text-ink-muted">{section.title}</h3>
              <ul className="mt-2 divide-y border-b">
                {section.tickets.map((ticket) => {
                  const inputId = ticketFieldName(ticket.id);
                  const hasGroupPrice = order.isGroup && ticket.price > GROUP_PRICE;
                  const price = (
                    <>
                      {hasGroupPrice && <s className="mr-2 text-small text-ink-muted">{formatPrice(ticket.price)}</s>}
                      {ticket.price === 0 ? "Gratuit" : formatPrice(hasGroupPrice ? GROUP_PRICE : ticket.price)}
                    </>
                  );
                  return (
                    <li key={ticket.id} className="flex items-center gap-4 py-5">
                      <label htmlFor={inputId} className="min-w-0 flex-1 cursor-pointer">
                        <span className="type-label block">{ticket.label}</span>
                        <span className="block text-small text-ink-muted">{ticket.detail}</span>
                        {/* Under the label on small screens, where the row has no room for a price column */}
                        <span className="mt-1 block tabular-nums sm:hidden">{price}</span>
                      </label>
                      <p className="hidden shrink-0 text-right tabular-nums sm:block">
                        {price}
                      </p>
                      <QuantityInput
                        id={inputId}
                        name={inputId}
                        label={ticket.label}
                        value={quantities[ticket.id]}
                        onChange={(value) => setQuantity(ticket.id, value)}
                        describedBy={ticketsError ? "tickets-error" : undefined}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p aria-live="polite" className="mt-4 text-small text-accent empty:hidden">
            {!order.isGroup && order.payingTickets >= GROUP_HINT_THRESHOLD
              ? `Encore ${ticketsToGroup} billet${ticketsToGroup > 1 ? "s" : ""} payant${ticketsToGroup > 1 ? "s" : ""} pour profiter du tarif groupe.`
              : ""}
          </p>
        </Step>

        <Step number="03" title="Options de visite">
          <p className="text-small text-ink-muted">Par personne, hors enfants de moins de 5 ans.</p>
          <ul className="mt-6 grid gap-3">
            {VISIT_OPTIONS.map((option) => (
              <li key={option.id}>
                <label className="flex cursor-pointer items-start gap-4 border p-5 transition-colors hover:border-ink has-checked:border-ink has-checked:bg-paper-deep">
                  <input
                    type="checkbox"
                    name="options"
                    value={option.id}
                    checked={options.includes(option.id)}
                    onChange={(event) => toggleOption(option.id, event.target.checked)}
                    className="mt-1.5 size-4 shrink-0 accent-ink"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="type-label block">{option.label}</span>
                    <span className="block text-small text-ink-muted">{option.description}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{formatPrice(option.price)}</span>
                </label>
              </li>
            ))}
            <li className="flex items-start gap-4 border border-dashed p-5">
              <span className="min-w-0 flex-1 pl-8">
                <span className="type-label block">Plan du musée</span>
                <span className="block text-small text-ink-muted">Remis gratuitement à l’accueil.</span>
              </span>
              <span className="shrink-0">Offert</span>
            </li>
          </ul>
        </Step>

        <Step number="04" title="Vos coordonnées">
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Nom" id="nom" error={errors.lastName}>
              <input
                id="nom"
                name="nom"
                type="text"
                autoComplete="family-name"
                required
                maxLength={60}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={errors.lastName ? "nom-error" : undefined}
                className={inputClasses}
              />
            </Field>
            <Field label="Prénom" id="prenom" error={errors.firstName}>
              <input
                id="prenom"
                name="prenom"
                type="text"
                autoComplete="given-name"
                required
                maxLength={60}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={errors.firstName ? "prenom-error" : undefined}
                className={inputClasses}
              />
            </Field>
            <Field label="Date de naissance" id="naissance" error={errors.birthDate}>
              <input
                id="naissance"
                name="naissance"
                type="date"
                autoComplete="bday"
                required
                min={birthDateBounds.min}
                max={birthDateBounds.max}
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                aria-invalid={Boolean(errors.birthDate)}
                aria-describedby={errors.birthDate ? "naissance-error" : undefined}
                className={inputClasses}
              />
            </Field>
            <Field label="Adresse e-mail" id="email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={inputClasses}
              />
            </Field>
          </div>

          <label
            className={cn(
              "mt-10 flex cursor-pointer items-start gap-4 border p-5 transition-colors hover:border-ink has-checked:border-ink has-checked:bg-paper-deep",
              errors.consent && !hasConsent && "border-accent",
            )}
          >
            <input
              type="checkbox"
              name="consentement"
              value="oui"
              required
              checked={hasConsent}
              onChange={(event) => setHasConsent(event.target.checked)}
              aria-invalid={Boolean(errors.consent) && !hasConsent}
              aria-describedby={errors.consent && !hasConsent ? "consentement-detail consentement-error" : "consentement-detail"}
              className="mt-1.5 size-4 shrink-0 accent-ink"
            />
            <span className="min-w-0 flex-1">
              <span className="block">
                J’accepte que mes informations (nom, prénom, date de naissance et e-mail) soient utilisées pour
                traiter ma réservation.
              </span>
              <span id="consentement-detail" className="mt-1 block text-small text-ink-muted">
                Elles servent uniquement à établir votre billet, ne sont transmises à aucun tiers et ne sont conservées
                qu’une heure, dans votre navigateur.
              </span>
            </span>
          </label>
          {/* The server error stops applying as soon as the box is ticked, without waiting for a new submission */}
          {errors.consent && !hasConsent && (
            <p id="consentement-error" className="mt-2 text-small text-accent">
              {errors.consent}
            </p>
          )}
        </Step>
      </div>

      {/* Mobile only: keeps the total in sight while the summary is still far below */}
      <div className="sticky bottom-0 z-10 -mx-gutter flex items-center justify-between gap-4 border-t bg-paper/95 px-gutter py-4 backdrop-blur-md lg:hidden">
        <p>
          <span className="block text-small text-ink-muted">
            {order.visitors} visiteur{order.visitors > 1 ? "s" : ""}
          </span>
          <span className="type-numeral text-h3">{formatPrice(order.total)}</span>
        </p>
        <a href="#recapitulatif" className={buttonClasses({ size: "sm" })}>
          Récapitulatif
        </a>
      </div>

      <OrderSummary
        id="recapitulatif"
        order={order}
        dateLabel={date ? formatVisitDate(date) : null}
        className="lg:col-span-4 lg:col-start-9"
      >
        {state.errors && (
          <p role="alert" className="mt-6 text-small text-accent">
            Certaines informations manquent, vérifiez les champs signalés.
          </p>
        )}
        <Button type="submit" disabled={isPending} className="mt-6 w-full">
          {isPending ? "Validation…" : "Valider la commande"}
        </Button>
      </OrderSummary>
    </form>
  );
}

type StepProps = {
  number: string;
  title: string;
  error?: string | null;
  errorId?: string;
  children: ReactNode;
};

function Step({ number, title, error, errorId, children }: StepProps) {
  return (
    // min-w-0: a fieldset defaults to min-content width, which lets wide content push the page sideways
    <fieldset className="min-w-0">
      <legend className="flex w-full items-baseline gap-4 border-b border-ink pb-4">
        <span className="text-small text-ink-muted tabular-nums">{number}</span>
        <span className="font-display text-h3 font-medium">{title}</span>
      </legend>
      <div className="mt-6">
        {children}
        {error && (
          <p id={errorId} className="mt-4 text-small text-accent">
            {error}
          </p>
        )}
      </div>
    </fieldset>
  );
}

type FieldProps = {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
};

function Field({ label, id, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-small text-ink-muted">
        {label}
      </label>
      {children}
      <p id={`${id}-error`} className={cn("mt-2 text-small text-accent", !error && "hidden")}>
        {error}
      </p>
    </div>
  );
}
