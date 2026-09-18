"use client";

import { TransitionLink } from "@/components/animation/TransitionLink";
import { UserIcon } from "@/components/ui/icons";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

type AccountLinkProps = {
  className?: string;
  onNavigate?: () => void;
};

// Read in the browser: asking for the session on the server would make every page of the site dynamic
export function AccountLink({ className, onNavigate }: AccountLinkProps) {
  const { data: session, isPending } = useSession();
  const isSignedIn = Boolean(session);

  return (
    <TransitionLink
      href={isSignedIn ? "/compte" : "/connexion"}
      onClick={onNavigate}
      // Hidden, not removed, while the session loads: the header keeps its width and does not jump
      aria-hidden={isPending || undefined}
      tabIndex={isPending ? -1 : undefined}
      className={cn(
        "link-underline inline-flex items-center gap-2 pb-0.5 text-small font-medium transition-opacity",
        isPending && "pointer-events-none opacity-0",
        className,
      )}
    >
      <UserIcon className="size-5 shrink-0" />
      {isSignedIn ? "Mon compte" : "Connexion"}
    </TransitionLink>
  );
}
