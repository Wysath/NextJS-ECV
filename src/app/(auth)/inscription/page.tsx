import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthSwitch } from "@/components/auth/AuthSwitch";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { REDIRECT_PARAM, getSafeRedirect, withRedirect } from "@/lib/redirect";
import { redirectIfSignedIn } from "@/lib/session";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte The Met.",
  robots: { index: false },
};

export default async function SignUpPage({ searchParams }: PageProps<"/inscription">) {
  const redirectTo = getSafeRedirect((await searchParams)[REDIRECT_PARAM]);
  await redirectIfSignedIn(redirectTo);
  // Kept in the link to the other form only when it is not the default, so the URL stays clean
  const forwardedRedirect = redirectTo === "/compte" ? undefined : redirectTo;

  return (
    <>
      <AuthHeading title="Créer un compte" intro="Quelques secondes suffisent pour rejoindre le musée en ligne." />
      <SignUpForm redirectTo={redirectTo} />
      <AuthSwitch question="Déjà inscrit ?" href={withRedirect("/connexion", forwardedRedirect)} label="Se connecter" />
    </>
  );
}
