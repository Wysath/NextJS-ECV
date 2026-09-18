import { TransitionLink } from "@/components/animation/TransitionLink";

type AuthSwitchProps = {
  question: string;
  href: string;
  label: string;
};

export function AuthSwitch({ question, href, label }: AuthSwitchProps) {
  return (
    <p className="mt-12 border-t pt-8 text-small text-ink-muted">
      {question}{" "}
      <TransitionLink href={href} className="link-underline font-medium text-ink">
        {label}
      </TransitionLink>
    </p>
  );
}
