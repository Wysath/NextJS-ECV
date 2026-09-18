import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { withRedirect } from "@/lib/redirect";

// Deduplicated per request: a layout and a page can both ask for the session without a second database query
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

// Checked in each page rather than in a layout: a layout is not rendered again when navigating between its pages
export async function requireSession(returnTo?: string) {
  const session = await getSession();
  if (!session) redirect(withRedirect("/connexion", returnTo));
  return session;
}

export async function redirectIfSignedIn(redirectTo = "/compte") {
  if (await getSession()) redirect(redirectTo);
}
