import { cn } from "@vendorly/utils";

import { ThemeWrapper } from "./theme-wrapper";

type StoreBannerProps = {
  bannerImage?: string;
  className?: string;
  description: string;
  logoImage?: string;
  name: string;
  themeColor?: string;
};

export function StoreBanner({
  bannerImage,
  className,
  description,
  logoImage,
  name,
  themeColor,
}: StoreBannerProps) {
  return (
    <ThemeWrapper
      themeColor={themeColor}
      className={cn(
        "overflow-hidden border border-black/10 bg-[#10211d] text-white",
        className,
      )}
    >
      <div className="grid min-h-[320px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative isolate min-h-[260px]">
          {bannerImage ? (
            <img
              alt={`${name} banner`}
              className="absolute inset-0 h-full w-full object-cover"
              src={bannerImage}
            />
          ) : null}
          <div
            className="absolute inset-0"
            style={{
              background: bannerImage
                ? "linear-gradient(135deg, rgba(15,23,42,0.12), rgba(15,23,42,0.55))"
                : "linear-gradient(135deg, var(--vendorly-theme), rgba(16,33,29,0.92) 58%, rgba(15,23,42,0.98))",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_72px)]" />
        </div>
        <div className="flex flex-col justify-between border-t border-white/10 bg-[rgba(11,20,18,0.9)] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div>
            {logoImage ? (
              <img
                alt={`${name} logo`}
                className="h-20 w-20 border border-white/20 object-cover"
                src={logoImage}
              />
            ) : (
              <span
                className="inline-flex h-20 w-20 items-center justify-center border border-white/20 text-lg font-semibold text-white"
                style={{ backgroundColor: "color-mix(in srgb, var(--vendorly-theme) 28%, transparent)" }}
              >
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="mt-4 inline-flex border border-white/20 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/70">
              Custom storefront
            </span>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight sm:text-6xl">
              {name}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-8 text-white/76 sm:text-base">
              {description}
            </p>
          </div>
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/55">
                Vendorly theme
              </p>
              <p className="mt-2 text-sm text-white/82">
                Built to feel like an independent brand site, not a generic vendor page.
              </p>
            </div>
            <span
              className="h-10 w-10 border border-white/20"
              style={{ backgroundColor: "var(--vendorly-theme)" }}
            />
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
