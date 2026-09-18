import type { ReactNode } from "react";

type AccountSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AccountSection({ title, description, children }: AccountSectionProps) {
  return (
    <section className="grid gap-8 border-t py-12 first:border-t-0 first:pt-0 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <h2 className="text-h3">{title}</h2>
        <p className="mt-3 text-small text-ink-muted">{description}</p>
      </div>
      <div className="lg:col-span-7 lg:col-start-6">{children}</div>
    </section>
  );
}
