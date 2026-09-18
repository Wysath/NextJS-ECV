"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import {
  type FieldErrors,
  type ProfileValues,
  NAME_MAX_LENGTH,
  getAuthErrorMessage,
  parseProfileForm,
} from "@/lib/auth-validation";

type ProfileFormProps = {
  user: ProfileValues;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors<ProfileValues>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { values, errors: fieldErrors } = parseProfileForm(new FormData(event.currentTarget));
    setErrors(fieldErrors ?? {});
    setError(null);
    setSuccess(null);
    if (fieldErrors) return;

    const hasNewName = values.name !== user.name;
    const hasNewEmail = values.email !== user.email;
    if (!hasNewName && !hasNewEmail) {
      setSuccess("Aucune modification à enregistrer.");
      return;
    }

    setIsPending(true);
    // Two endpoints: Better Auth refuses an email in update-user, since changing it can require a verification
    if (hasNewName) {
      const { error: nameError } = await authClient.updateUser({ name: values.name });
      if (nameError) return fail(getAuthErrorMessage(nameError));
    }
    if (hasNewEmail) {
      const { error: emailError } = await authClient.changeEmail({ newEmail: values.email });
      if (emailError) return fail(getAuthErrorMessage(emailError));
      // An address already in use is answered with a success that changes nothing, so accounts cannot be probed
      // through this form: only the session tells whether the change went through
      const { data } = await authClient.getSession();
      if (data?.user.email !== values.email) {
        setErrors({ email: "Cette adresse e-mail ne peut pas être utilisée." });
        return fail(hasNewName ? "Votre nom a été enregistré, mais pas l’adresse e-mail." : null);
      }
    }

    setIsPending(false);
    setSuccess("Vos informations ont été enregistrées.");
    // The page above this form was rendered with the previous values
    router.refresh();
  }

  function fail(message: string | null) {
    setError(message);
    setIsPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isPending} className="flex flex-col gap-8">
      <FormAlert message={error} />
      <FormAlert message={success} tone="success" />
      <AuthField
        name="name"
        label="Nom complet"
        type="text"
        autoComplete="name"
        maxLength={NAME_MAX_LENGTH}
        defaultValue={user.name}
        required
        error={errors.name}
      />
      <AuthField
        name="email"
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        defaultValue={user.email}
        required
        error={errors.email}
      />
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
