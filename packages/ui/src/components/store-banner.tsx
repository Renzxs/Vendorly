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
        "overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-sm",
        className,
      )}
    >
      <div className="relative isolate min-h-[280px]">
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
            "relative flex min-h-[280px] flex-col justify-end",
            isCompact ? "p-5" : "p-6 sm:p-8 lg:p-10",
          )}
        >
          <div className={cn(isCompact ? "max-w-none" : "max-w-3xl")}>
            <span
              className={cn(
                "inline-flex rounded-full border border-white/20 bg-white/10 font-semibold uppercase text-white/75",
                isCompact
                  ? "px-3 py-1 text-[0.62rem] tracking-[0.22em]"
                  : "px-3 py-1 text-[0.68rem] tracking-[0.28em]",
              )}
            >
              Official storefront
            </span>
            <div
              className={cn(
                "flex items-start",
                isCompact ? "mt-4 gap-3" : "mt-5 gap-4",
              )}
            >
              {logoImage ? (
                <img
                  alt={`${name} logo`}
                  className={cn(
                    "border border-white/20 object-cover",
                    isCompact
                      ? "h-14 w-14 rounded-2xl"
                      : "h-20 w-20 rounded-3xl",
                  )}
                  src={logoImage}
                />
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center justify-center border border-white/20 font-semibold text-white",
                    isCompact
                      ? "h-14 w-14 rounded-2xl text-base"
                      : "h-20 w-20 rounded-3xl text-lg",
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
                      ? "text-3xl leading-[0.92]"
                      : "text-4xl leading-none sm:text-5xl lg:text-6xl",
                  )}
                >
                  {name}
                </h1>
                <p
                  className={cn(
                    "max-w-2xl text-white/78",
                    isCompact
                      ? "mt-3 text-sm leading-6"
                      : "mt-4 text-sm leading-7 sm:text-base",
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
              isCompact ? "mt-6 gap-3 text-xs" : "mt-8 gap-4 text-sm",
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
                isCompact ? "gap-2 px-4 py-2" : "gap-3 px-4 py-2",
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
