"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/Button";
import { signIn } from "@/lib/auth-client";
import { type FieldErrors, type SignInValues, getAuthErrorMessage, parseSignInForm } from "@/lib/auth-validation";

type SignInFormProps = {
  // Already checked by the page to be a path on this site
  redirectTo: string;
};

export function SignInForm({ redirectTo }: SignInFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors<SignInValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { values, errors: fieldErrors } = parseSignInForm(new FormData(event.currentTarget));
    setErrors(fieldErrors ?? {});
    setFormError(null);
    if (fieldErrors) return;

    setIsPending(true);
    // Signed in from the browser rather than a Server Action: the client then refreshes useSession itself, so the
    // header account link updates without reloading the page
    const { error } = await signIn.email(values);
    if (error) {
      setFormError(getAuthErrorMessage(error));
      setIsPending(false);
      return;
    }
    // replace: going back must not return to a form the visitor no longer needs
    router.replace(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isPending} className="flex flex-col gap-8">
      <FormAlert message={formError} />
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
        autoComplete="current-password"
        required
        error={errors.password}
      />
      <Button type="submit" disabled={isPending} className="mt-2 w-full sm:w-auto sm:self-start">
        {isPending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
