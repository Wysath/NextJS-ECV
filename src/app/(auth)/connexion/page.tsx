import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthSwitch } from "@/components/auth/AuthSwitch";
import { SignInForm } from "@/components/auth/SignInForm";
import { REDIRECT_PARAM, getSafeRedirect, withRedirect } from "@/lib/redirect";
import { redirectIfSignedIn } from "@/lib/session";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte The Met.",
  robots: { index: false },
};

export default async function SignInPage({ searchParams }: PageProps<"/connexion">) {
  const redirectTo = getSafeRedirect((await searchParams)[REDIRECT_PARAM]);
  await redirectIfSignedIn(redirectTo);
  // Kept in the link to the other form only when it is not the default, so the URL stays clean
  const forwardedRedirect = redirectTo === "/compte" ? undefined : redirectTo;

  return (
    <>
      <AuthHeading title="Connexion" intro="Retrouvez vos informations et préparez votre prochaine visite." />
      <SignInForm redirectTo={redirectTo} />
      <AuthSwitch question="Pas encore de compte ?" href={withRedirect("/inscription", forwardedRedirect)} label="Créer un compte" />
    </>
  );
}
