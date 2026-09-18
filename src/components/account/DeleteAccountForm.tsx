"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage, parseDeleteAccountForm } from "@/lib/auth-validation";

export function DeleteAccountForm() {
  const router = useRouter();
  // Two steps: an irreversible action must not sit one click away from the other account settings
  const [isConfirming, setIsConfirming] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { values, errors } = parseDeleteAccountForm(new FormData(event.currentTarget));
    setPasswordError(errors?.password);
    setError(null);
    if (errors) return;

    setIsPending(true);
    // The password is checked by Better Auth before anything is deleted; favorites go with the user through the
    // foreign key cascade
    const { error: apiError } = await authClient.deleteUser({ password: values.password });
    if (apiError) {
      setIsPending(false);
      if (apiError.code === "INVALID_PASSWORD") setPasswordError("Mot de passe incorrect.");
      else setError(getAuthErrorMessage(apiError));
      return;
    }
    router.replace("/");
  }

  if (!isConfirming) {
    return (
      <Button variant="outline-danger" onClick={() => setIsConfirming(true)}>
        Supprimer mon compte
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isPending} className="flex flex-col gap-8 border border-accent/40 p-6 sm:p-8">
      <p>
        Votre compte et vos favoris seront supprimés définitivement. Saisissez votre mot de passe pour confirmer.
      </p>
      <FormAlert message={error} />
      <AuthField
        name="password"
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        required
        // The field appears after a click on purpose, so moving the focus to it is expected
        autoFocus
        error={passwordError}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="danger" disabled={isPending}>
          {isPending ? "Suppression…" : "Supprimer définitivement"}
        </Button>
        <Button variant="outline" onClick={() => setIsConfirming(false)} disabled={isPending}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
