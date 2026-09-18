"use client";

import { TransitionLink } from "@/components/animation/TransitionLink";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

type NavLinksProps = {
  label?: string;
  className?: string;
  listClassName?: string;
  linkClassName?: string;
  onNavigate?: () => void;
};

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({
  label = "Navigation principale",
  className,
  listClassName,
  linkClassName,
  onNavigate,
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className={className}>
      <ul className={listClassName}>
        {siteConfig.nav.map((item) => (
          <li key={item.href}>
            <TransitionLink
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "link-underline pb-0.5 transition-colors aria-[current=page]:text-accent",
                linkClassName,
              )}
            >
              {item.label}
            </TransitionLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
