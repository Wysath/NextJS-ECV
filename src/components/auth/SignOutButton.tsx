"use client";

import { useSignOut } from "@/components/auth/useSignOut";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const { signOut, isPending } = useSignOut();

  return (
    <Button variant="outline" onClick={signOut} disabled={isPending}>
      {isPending ? "Déconnexion…" : "Se déconnecter"}
    </Button>
  );
}
