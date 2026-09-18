"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

// Covers /tableaux and every painting page, which all depend on the external museum API
export default function PaintingsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="wrapper py-section">
      <h1 className="max-w-4xl text-h1">Les tableaux n’ont pas pu être chargés.</h1>
      <p className="mt-6 max-w-prose text-lead text-ink-muted">
        L’API du musée ne répond pas pour le moment. Réessayez dans quelques instants.
      </p>
      <Button onClick={() => retry()} className="mt-10">
        Réessayer
      </Button>
    </section>
  );
}
