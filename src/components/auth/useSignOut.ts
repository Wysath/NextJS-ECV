"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { isProtectedPath } from "@/lib/redirect";

export function useSignOut() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    await signOut();
    // Elsewhere the visitor stays put: useSession already updates the header and the favorite button
    if (isProtectedPath(pathname)) router.replace("/");
    else setIsPending(false);
  }

  return { signOut: handleSignOut, isPending };
}
