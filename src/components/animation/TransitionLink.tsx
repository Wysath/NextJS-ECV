"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { getRouteLabel } from "@/config/site";
import { useSiteStore } from "@/stores/site-store";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  // Needed for dynamic pages, whose name cannot be read from the URL
  transitionLabel?: string;
};

// Drop-in for next/link that holds the navigation until the curtain covers the page.
// onNavigate only fires for client-side navigations, so modifier clicks and new tabs keep their native behavior.
export function TransitionLink({ href, transitionLabel, onNavigate, ...props }: TransitionLinkProps) {
  return (
    <Link
      href={href}
      {...props}
      onNavigate={(event) => {
        onNavigate?.(event);
        const url = new URL(href, window.location.href);
        // Same page with other search params or a hash: nothing changes enough to deserve a curtain
        if (url.pathname === window.location.pathname) return;
        // An instant curtain would only turn the loading time into a blank screen
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        event.preventDefault();
        useSiteStore.getState().navigate(`${url.pathname}${url.search}${url.hash}`, transitionLabel ?? getRouteLabel(url.pathname));
      }}
    />
  );
}
