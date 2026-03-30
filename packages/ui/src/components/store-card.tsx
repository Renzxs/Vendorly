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
        "flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: "var(--vendorly-theme)" }}
      />
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {store.logoImage ? (
              <img
                alt={`${store.name} logo`}
                className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
                src={store.logoImage}
              />
            ) : (
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 text-sm font-semibold text-slate-950"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--vendorly-theme) 12%, white)",
                }}
              >
                {getInitials(store.name)}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Seller storefront
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-slate-950">
                {store.name}
              </h3>
            </div>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {store.layoutType}
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm leading-6 text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
            {store.description}
          </p>
          {store.bio ? (
            <p className="text-sm leading-6 text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
              {store.bio}
            </p>
          ) : null}
        </div>

        {socialLinks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <span
                key={link.label}
                className="rounded-full border border-slate-200 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500"
              >
                {link.label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Browse products
          </p>
          <a
            href={storeHref}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-white"
          >
            {ctaLabel}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </ThemeWrapper>
  );
}
