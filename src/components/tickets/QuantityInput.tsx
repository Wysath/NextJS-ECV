"use client";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { MAX_TICKETS_PER_TYPE, clampQuantity } from "@/lib/tickets";

type QuantityInputProps = {
  id: string;
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  describedBy?: string;
};

const stepButtonClasses =
  "flex size-10 items-center justify-center rounded-full transition-colors hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30";

export function QuantityInput({ id, name, label, value, onChange, describedBy }: QuantityInputProps) {
  return (
    <div className="flex shrink-0 items-center rounded-full border">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value === 0}
        aria-label={`Retirer un billet ${label}`}
        className={stepButtonClasses}
      >
        <MinusIcon className="size-4" />
      </button>
      {/* A real input keeps the form submittable without JavaScript and lets large groups type a number */}
      <input
        id={id}
        name={name}
        type="number"
        inputMode="numeric"
        min={0}
        max={MAX_TICKETS_PER_TYPE}
        value={value}
        onChange={(event) => onChange(clampQuantity(event.target.valueAsNumber))}
        onFocus={(event) => event.target.select()}
        aria-describedby={describedBy}
        className="w-9 bg-transparent text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value === MAX_TICKETS_PER_TYPE}
        aria-label={`Ajouter un billet ${label}`}
        className={stepButtonClasses}
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
