import { cn } from "@vendorly/utils";

import { ThemeWrapper } from "./theme-wrapper";

type StoreBannerProps = {
  bannerImage?: string;
  className?: string;
  description: string;
  logoImage?: string;
  name: string;
  themeColor?: string;
  variant?: "compact" | "default";
};

export function StoreBanner({
  bannerImage,
  className,
  description,
  logoImage,
  name,
  themeColor,
  variant = "default",
}: StoreBannerProps) {
  const isCompact = variant === "compact";

  return (
    <ThemeWrapper
      themeColor={themeColor}
      className={cn(
        "overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 text-white shadow-sm",
        className,
      )}
    >
      <div className="relative isolate min-h-[240px]">
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
              ? "linear-gradient(90deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.55) 40%, rgba(15,23,42,0.3) 100%)"
              : "linear-gradient(120deg, var(--vendorly-theme) 0%, rgba(15,23,42,0.94) 58%, rgba(15,23,42,1) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.18)_100%)]" />
        <div
          className={cn(
            "relative flex min-h-[240px] flex-col justify-end",
            isCompact ? "p-4" : "p-5 sm:p-6 lg:p-8",
          )}
        >
          <div className={cn(isCompact ? "max-w-none" : "max-w-3xl")}>
            <span
              className={cn(
                "inline-flex rounded-full border border-white/20 bg-white/10 font-semibold uppercase text-white/75",
                isCompact
                  ? "px-3 py-1 text-[0.62rem] tracking-[0.22em]"
                  : "px-3 py-1 text-[0.64rem] tracking-[0.24em]",
              )}
            >
              Official storefront
            </span>
            <div
                className={cn(
                  "flex items-start",
                  isCompact ? "mt-3 gap-3" : "mt-4 gap-3",
                )}
            >
              {logoImage ? (
                <img
                  alt={`${name} logo`}
                  className={cn(
                    "border border-white/20 object-cover",
                    isCompact
                      ? "h-14 w-14 rounded-2xl"
                      : "h-16 w-16 rounded-2xl",
                  )}
                  src={logoImage}
                />
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center justify-center border border-white/20 font-semibold text-white",
                    isCompact
                      ? "h-14 w-14 rounded-2xl text-base"
                      : "h-16 w-16 rounded-2xl text-base",
                  )}
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--vendorly-theme) 28%, transparent)",
                  }}
                >
                  {name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <h1
                  className={cn(
                    "break-words font-[family-name:var(--font-display)] tracking-tight",
                    isCompact
                      ? "text-[1.9rem] leading-[0.94]"
                      : "text-3xl leading-none sm:text-4xl lg:text-5xl",
                  )}
                >
                  {name}
                </h1>
                <p
                  className={cn(
                    "max-w-2xl text-white/78",
                    isCompact
                      ? "mt-3 text-sm leading-6"
                      : "mt-3 text-sm leading-6 sm:text-base",
                  )}
                >
                  {description}
                </p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex flex-wrap items-center text-white/72",
              isCompact ? "mt-5 gap-3 text-xs" : "mt-6 gap-3 text-sm",
            )}
          >
            <div
              className={cn(
                "rounded-full border border-white/15 bg-white/10",
                isCompact ? "px-4 py-2" : "px-4 py-2",
              )}
            >
              Shopping made simple
            </div>
            <div
              className={cn(
                "flex items-center rounded-full border border-white/15 bg-white/10",
                isCompact ? "gap-2 px-4 py-2" : "gap-2.5 px-4 py-2",
              )}
            >
              <span
                className={cn(
                  "rounded-full",
                  isCompact ? "h-2.5 w-2.5" : "h-3 w-3",
                )}
                style={{ backgroundColor: "var(--vendorly-theme)" }}
              />
              Theme color
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
              Fast catalog browsing
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
