import { TransitionLink } from "@/components/animation/TransitionLink";
import { AccountLink } from "@/components/auth/AccountLink";
import { QuickSignOut } from "@/components/auth/QuickSignOut";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavLinks } from "@/components/layout/NavLinks";
import { SearchForm } from "@/components/layout/SearchForm";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-paper/90 backdrop-blur-md">
      <div className="wrapper flex h-header items-center gap-10">
        <TransitionLink
          href="/"
          aria-label={`${siteConfig.name}, accueil`}
          className="wordmark text-h3 leading-none"
        >
          {siteConfig.name}
        </TransitionLink>

        {/* Same breakpoint as the header search: below it, both live in the mobile menu, so no width is left without search */}
        <NavLinks
          className="hidden lg:block"
          listClassName="flex items-center gap-8 text-small font-medium"
        />

        <div className="ml-auto flex items-center gap-4">
          {/* Narrower at lg, where the nav, the account links and the ticket button leave no room for a wide field */}
          <SearchForm id="search-desktop" className="hidden lg:block lg:w-56 xl:w-72" />
          {/* max-md:hidden rather than hidden md:inline-flex: cn does not merge classes, and the base inline-flex of
              these links is emitted after hidden, so it would win on phones */}
          <AccountLink className="max-md:hidden" />
          <QuickSignOut compact className="max-md:hidden" />
          <Button href="/billetterie" size="sm" className="max-md:hidden">
            Billetterie
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
