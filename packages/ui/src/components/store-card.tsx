import type { Store } from "@vendorly/utils";
import { cn, getInitials, getStoreSocialLinks } from "@vendorly/utils";

import { ThemeWrapper } from "./theme-wrapper";

type StoreCardProps = {
  className?: string;
  ctaLabel?: string;
  href?: string;
  store: Pick<
    Store,
    | "bio"
    | "description"
    | "instagramUrl"
    | "layoutType"
    | "logoImage"
    | "name"
    | "slug"
    | "themeColor"
    | "tiktokUrl"
    | "websiteUrl"
    | "xUrl"
  >;
};

export function StoreCard({
  className,
  ctaLabel = "Visit storefront",
  href,
  store,
}: StoreCardProps) {
  const storeHref = href ?? `/store/${store.slug}`;
  const socialLinks = getStoreSocialLinks(store);

  return (
    <ThemeWrapper
      as="article"
      themeColor={store.themeColor}
      className={cn(
        "border border-black/10 bg-[rgba(255,253,247,0.92)]",
        className,
      )}
    >
      <div className="grid gap-6 border-l-4 border-[color:var(--vendorly-theme)] p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start">
        {store.logoImage ? (
          <img
            alt={`${store.name} logo`}
            className="h-16 w-16 border border-slate-900 object-cover"
            src={store.logoImage}
          />
        ) : (
          <div
            className="inline-flex h-14 w-14 items-center justify-center border border-slate-900 text-sm font-semibold text-slate-950"
            style={{
              backgroundColor: "color-mix(in srgb, var(--vendorly-theme) 12%, white)",
            }}
          >
            {getInitials(store.name)}
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-slate-950">
              {store.name}
            </h3>
            <span className="border border-black/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
              {store.layoutType} layout
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {store.description}
          </p>
          {store.bio ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              {store.bio}
            </p>
          ) : null}
          {socialLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <span
                  key={link.label}
                  className="border border-black/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500"
                >
                  {link.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <a
          href={storeHref}
          className="inline-flex items-center gap-2 self-start border-b border-slate-900 pb-1 text-sm font-semibold text-slate-950 transition hover:text-[color:var(--vendorly-theme)]"
        >
          {ctaLabel}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </ThemeWrapper>
  );
}
