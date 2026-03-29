import { cn } from "@vendorly/utils";

import { Logo } from "./logo";

type NavbarLink = {
  href: string;
  label: string;
};

type NavbarProps = {
  badge?: string;
  className?: string;
  ctaHref?: string;
  ctaLabel?: string;
  links?: NavbarLink[];
};

export function Navbar({
  badge = "Marketplace OS",
  className,
  ctaHref,
  ctaLabel,
  links = [],
}: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-black/10 bg-[rgba(247,242,232,0.9)] backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-4">
            <Logo
              label={badge}
              textClassName="space-y-0.5"
              markClassName="shrink-0"
            />
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="border-b border-transparent pb-1 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        {ctaHref && ctaLabel ? (
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </header>
  );
}
