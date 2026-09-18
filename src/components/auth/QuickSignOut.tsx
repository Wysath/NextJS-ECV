"use client";

import { useSignOut } from "@/components/auth/useSignOut";
import { SignOutIcon } from "@/components/ui/icons";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

type QuickSignOutProps = {
  // Icon only, for the header bar where the label would crowd the navigation
  compact?: boolean;
  className?: string;
  onSignedOut?: () => void;
};

const label = "Se déconnecter";

export function QuickSignOut({ compact = false, className, onSignedOut }: QuickSignOutProps) {
  const { data: session } = useSession();
  const { signOut, isPending } = useSignOut();

  if (!session) return null;

  return (
    <button
      type="button"
      disabled={isPending}
      title={compact ? label : undefined}
      aria-label={compact ? label : undefined}
      onClick={async () => {
        await signOut();
        onSignedOut?.();
      }}
      className={cn(
        "inline-flex items-center gap-2 text-small font-medium text-ink-muted transition-colors hover:text-ink disabled:opacity-60",
        compact ? "size-9 justify-center rounded-full border hover:border-ink" : "link-underline pb-0.5",
        className,
      )}
    >
      <SignOutIcon className="size-5 shrink-0" />
      {compact ? null : isPending ? "Déconnexion…" : label}
    </button>
  );
}
