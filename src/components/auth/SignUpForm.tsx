"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/Button";
import { signUp } from "@/lib/auth-client";
import {
  type FieldErrors,
  type SignUpValues,
  NAME_MAX_LENGTH,
  PASSWORD_RULES,
  getAuthErrorMessage,
  parseSignUpForm,
} from "@/lib/auth-validation";

type SignUpFormProps = {
  // Already checked by the page to be a path on this site
  redirectTo: string;
};

export function SignUpForm({ redirectTo }: SignUpFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors<SignUpValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { values, errors: fieldErrors } = parseSignUpForm(new FormData(event.currentTarget));
    setErrors(fieldErrors ?? {});
    setFormError(null);
    if (fieldErrors) return;

    setIsPending(true);
    // Better Auth signs the new account in straight away, so the visitor goes on where they were heading
    const { error } = await signUp.email(values);
    if (error) {
      setFormError(getAuthErrorMessage(error));
      setIsPending(false);
      return;
    }
    router.replace(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isPending} className="flex flex-col gap-8">
      <FormAlert message={formError} />
      <AuthField
        name="name"
        label="Nom complet"
        type="text"
        autoComplete="name"
        maxLength={NAME_MAX_LENGTH}
        required
        error={errors.name}
      />
      <AuthField
        name="email"
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        error={errors.email}
      />
      <AuthField
        name="password"
        label="Mot de passe"
        type="password"
        // Lets password managers offer a generated password
        autoComplete="new-password"
        minLength={PASSWORD_RULES.minLength}
        maxLength={PASSWORD_RULES.maxLength}
        required
        hint={`${PASSWORD_RULES.minLength} caractères minimum.`}
        error={errors.password}
      />
      <Button type="submit" disabled={isPending} className="mt-2 w-full sm:w-auto sm:self-start">
        {isPending ? "Création du compte…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
