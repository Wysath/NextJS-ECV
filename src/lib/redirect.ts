export const REDIRECT_PARAM = "redirection";

// Only same-site paths: an absolute or protocol-relative URL here would turn sign in into an open redirect
export function getSafeRedirect(value: unknown, fallback = "/compte") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

export function withRedirect(path: string, redirectTo: string | undefined) {
  return redirectTo ? `${path}?${new URLSearchParams({ [REDIRECT_PARAM]: redirectTo })}` : path;
}

// Pages that call requireSession: signing out while on one must leave it rather than show a session that is gone
const PROTECTED_PATHS = ["/compte"];

export function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
