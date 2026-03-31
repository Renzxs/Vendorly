import type { ReactNode } from "react";

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
  rightAccessory?: ReactNode;
};

export function Navbar({
  badge = "Marketplace OS",
  className,
  ctaHref,
  ctaLabel,
  links = [],
  rightAccessory,
}: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[82rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <a href="/" className="flex items-center gap-4">
            <Logo
              label={badge}
              textClassName="space-y-0.5"
              markClassName="shrink-0 bg-white"
            />
          </a>
          <nav className="hidden items-center gap-5 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          {rightAccessory}
          {ctaHref && ctaLabel ? (
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
