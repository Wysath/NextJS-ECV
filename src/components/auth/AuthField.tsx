import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type AuthFieldProps = Omit<ComponentProps<"input">, "id" | "name"> & {
  name: string;
  label: string;
  error?: string;
  hint?: ReactNode;
};

export function AuthField({ name, label, error, hint, className, ...inputProps }: AuthFieldProps) {
  const id = `auth-${name}`;
  // The error replaces the hint, as it usually repeats the same rule
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="text-small text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="mt-2 h-12 w-full border-b border-ink/30 bg-transparent text-lead transition-colors focus:border-ink focus-visible:outline-offset-4 aria-invalid:border-accent"
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-small text-ink-muted">
          {hint}
        </p>
      )}
      <p id={`${id}-error`} className={cn("mt-2 text-small text-accent", !error && "hidden")}>
        {error}
      </p>
    </div>
  );
}
