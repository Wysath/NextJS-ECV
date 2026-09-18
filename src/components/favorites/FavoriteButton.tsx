"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { setFavorite } from "@/app/actions/favorites";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { HeartIcon } from "@/components/ui/icons";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { withRedirect } from "@/lib/redirect";

type FavoriteButtonProps = {
  slug: string;
  className?: string;
};

// Tagged with what it was fetched for: navigating to another painting, or switching accounts, reuses this component,
// and the previous status must not show while the new request runs
type FavoriteStatus = { key: string; isFavorite: boolean };

const baseClasses = "link-cta group transition-opacity";

export function FavoriteButton({ slug, className }: FavoriteButtonProps) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const userId = session?.user.id;
  const statusKey = `${userId}:${slug}`;
  const [status, setStatus] = useState<FavoriteStatus | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, startTransition] = useTransition();
  const signInHref = withRedirect("/connexion", `/tableaux/${slug}`);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    fetch(`/api/favorites/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { isFavorite: false }))
      .then((data: { isFavorite: boolean }) => setStatus({ key: `${userId}:${slug}`, isFavorite: data.isFavorite }))
      .catch(() => {});
    return () => controller.abort();
  }, [slug, userId]);

  const isFavorite = status?.key === statusKey ? status.isFavorite : null;

  if (!isSessionPending && !session) {
    return (
      <TransitionLink href={signInHref} className={cn(baseClasses, "link-underline", className)}>
        <HeartIcon className="size-5" />
        Ajouter aux favoris
      </TransitionLink>
    );
  }

  const isLoading = isSessionPending || isFavorite === null;

  function toggle() {
    if (isFavorite === null) return;
    const next = !isFavorite;
    // Optimistic: the heart answers at once, and goes back if the server refuses
    setStatus({ key: statusKey, isFavorite: next });
    setMessage("");
    startTransition(async () => {
      const result = await setFavorite(slug, next);
      if (result.ok) {
        setMessage(next ? "Ajouté à vos favoris." : "Retiré de vos favoris.");
        return;
      }
      setStatus({ key: statusKey, isFavorite: !next });
      if (result.reason === "unauthenticated") router.push(signInHref);
      else setMessage("Impossible d’enregistrer ce favori.");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={isLoading || isSaving}
        // Kept in place while loading so the row does not jump once the status arrives
        aria-hidden={isLoading || undefined}
        className={cn(baseClasses, "link-underline disabled:cursor-default", isLoading && "opacity-0", className)}
      >
        <HeartIcon
          className={cn("size-5 transition-colors", isFavorite ? "fill-accent text-accent" : "group-hover:text-accent")}
        />
        {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </button>
      <p role="status" className="sr-only">
        {message}
      </p>
    </>
  );
}
