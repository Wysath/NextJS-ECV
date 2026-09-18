"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountLink } from "@/components/auth/AccountLink";
import { QuickSignOut } from "@/components/auth/QuickSignOut";
import { NavLinks } from "@/components/layout/NavLinks";
import { SearchForm } from "@/components/layout/SearchForm";
import { Button } from "@/components/ui/Button";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

export function MobileMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [previousPathname, setPreviousPathname] = useState(pathname);

  // Covers navigations that bypass our handlers (browser back/forward)
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setIsOpen((open) => !open)}
        className="flex size-10 items-center justify-center rounded-full border transition-colors hover:border-ink"
      >
        {isOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      {/* absolute, not fixed: the header's backdrop-filter makes it the containing block of fixed children */}
      <div
        id="mobile-menu"
        hidden={!isOpen}
        className="absolute inset-x-0 top-full h-[calc(100dvh-var(--spacing-header))] overflow-y-auto border-t bg-paper"
      >
        <div className="wrapper flex flex-col gap-10 py-10">
          <SearchForm id="search-mobile" onSubmit={close} />
          <NavLinks
            label="Navigation mobile"
            listClassName="flex flex-col items-start gap-5"
            linkClassName="font-display text-h2 font-medium"
            onNavigate={close}
          />
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <AccountLink onNavigate={close} className="text-body" />
            <QuickSignOut onSignedOut={close} className="text-body" />
          </div>
          <Button href="/billetterie" onClick={close} className="self-start">
            Réserver un billet
          </Button>
        </div>
      </div>
    </div>
  );
}
