import type { ReactNode } from "react";
import { TextReveal } from "@/components/animation/TextReveal";

type AuthHeadingProps = {
  title: string;
  intro: ReactNode;
};

export function AuthHeading({ title, intro }: AuthHeadingProps) {
  return (
    <header className="mb-12">
      <TextReveal trigger="load">
        <h1 className="text-h1">{title}</h1>
      </TextReveal>
      <p className="mt-6 text-lead text-ink-muted">{intro}</p>
    </header>
  );
}
