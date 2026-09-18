"use client";

import { startTransition, useOptimistic, useState } from "react";
import { setFavorite } from "@/app/actions/favorites";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { PaintingCoverImage } from "@/components/paintings/PaintingCoverImage";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import type { FavoritePainting } from "@/lib/favorite-paintings";

type FavoriteGalleryProps = {
  paintings: FavoritePainting[];
};

export function FavoriteGallery({ paintings }: FavoriteGalleryProps) {
  // The card leaves at once; the server action then revalidates the page, which confirms the list or brings it back
  const [visiblePaintings, removeOptimistically] = useOptimistic(paintings, (current, slug: string) =>
    current.filter((painting) => painting.slug !== slug),
  );
  const [message, setMessage] = useState("");

  function remove(painting: FavoritePainting) {
    startTransition(async () => {
      removeOptimistically(painting.slug);
      const result = await setFavorite(painting.slug, false);
      setMessage(result.ok ? `${painting.title} retiré de vos favoris.` : "Impossible de retirer ce favori.");
    });
  }

  return (
    <>
      <p role="status" className="sr-only">
        {message}
      </p>
      {visiblePaintings.length === 0 ? (
        <div className="max-w-prose">
          <p className="text-lead text-ink-muted">
            Votre galerie est vide. Ajoutez des œuvres depuis leur fiche pour les retrouver ici.
          </p>
          <TransitionLink href="/tableaux" className={buttonClasses({ className: "mt-8" })}>
            Explorer les tableaux
          </TransitionLink>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {visiblePaintings.map((painting) => (
            <li key={painting.slug} className="group relative">
              <TransitionLink
                href={`/tableaux/${painting.slug}`}
                transitionLabel={painting.title}
                data-cursor="Voir"
                className="block"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-paper-deep">
                  {painting.image && (
                    <PaintingCoverImage
                      image={painting.image}
                      sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 50vw"
                      className="transition-transform duration-700 ease-museum group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <h3 className="mt-4 text-lead leading-snug transition-colors group-hover:text-accent">
                  {painting.title}
                </h3>
                <p className="mt-1 text-small text-ink-muted">
                  {[painting.artist, painting.year].filter(Boolean).join(", ")}
                </p>
              </TransitionLink>
              {/* Outside the link: a button nested in an anchor is invalid and would also follow the link */}
              <button
                type="button"
                onClick={() => remove(painting)}
                aria-label={`Retirer ${painting.title} des favoris`}
                className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-paper/90 text-ink backdrop-blur-sm transition-colors hover:bg-accent hover:text-paper"
              >
                <CloseIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
