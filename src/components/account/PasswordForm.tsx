"use client";

import { type FormEvent, useState } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import {
  type FieldErrors,
  type PasswordValues,
  PASSWORD_RULES,
  getAuthErrorMessage,
  parsePasswordForm,
} from "@/lib/auth-validation";

export function PasswordForm() {
  const [errors, setErrors] = useState<FieldErrors<PasswordValues>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Kept before the await: React clears currentTarget once the handler has returned
    const form = event.currentTarget;
    const { values, errors: fieldErrors, revokeOtherSessions } = parsePasswordForm(new FormData(form));
    setErrors(fieldErrors ?? {});
    setError(null);
    setSuccess(null);
    if (fieldErrors) return;

    setIsPending(true);
    const { error: apiError } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions,
    });
    setIsPending(false);

    if (apiError) {
      if (apiError.code === "INVALID_PASSWORD") setErrors({ currentPassword: "Mot de passe actuel incorrect." });
      else setError(getAuthErrorMessage(apiError));
      return;
    }
    // Passwords must not linger in the fields once saved
    form.reset();
    setSuccess(
      revokeOtherSessions
        ? "Mot de passe modifié. Vos autres appareils ont été déconnectés."
        : "Mot de passe modifié.",
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isPending} className="flex flex-col gap-8">
      <FormAlert message={error} />
      <FormAlert message={success} tone="success" />
      <AuthField
        name="currentPassword"
        label="Mot de passe actuel"
        type="password"
        autoComplete="current-password"
        required
        error={errors.currentPassword}
      />
      <AuthField
        name="newPassword"
        label="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        minLength={PASSWORD_RULES.minLength}
        maxLength={PASSWORD_RULES.maxLength}
        required
        hint={`${PASSWORD_RULES.minLength} caractères minimum.`}
        error={errors.newPassword}
      />
      <AuthField
        name="confirmPassword"
        label="Confirmer le nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" name="revokeOtherSessions" defaultChecked className="mt-1.5 size-4 shrink-0 accent-ink" />
        <span>Déconnecter mes autres appareils</span>
      </label>
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Modification…" : "Modifier le mot de passe"}
      </Button>
    </form>
  );
}
