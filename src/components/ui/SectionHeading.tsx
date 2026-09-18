import type { ReactNode } from "react";
import { TextReveal } from "@/components/animation/TextReveal";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({
  title,
  intro,
  action,
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-8 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        <TextReveal>
          <Heading className={Heading === "h1" ? "text-h1" : "text-h2"}>{title}</Heading>
        </TextReveal>
        {intro && <p className="mt-6 max-w-prose text-lead text-ink-muted">{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
