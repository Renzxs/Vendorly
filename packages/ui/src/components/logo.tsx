import { cn } from "@vendorly/utils";

type LogoProps = {
  className?: string;
  label?: string;
  markClassName?: string;
  textClassName?: string;
};

export function Logo({
  className,
  label = "Storefront commerce",
  markClassName,
  textClassName,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center border border-slate-900 bg-[rgba(255,253,247,0.92)] text-slate-950",
          markClassName,
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 64 64"
          className="h-7 w-7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="10" y="10" width="44" height="44" rx="10" fill="#0F172A" />
          <path
            d="M18 23H46"
            stroke="#F8FAFC"
            strokeWidth="3.5"
            strokeLinecap="square"
          />
          <path
            d="M22 28L32 43L42 28"
            stroke="#EAB308"
            strokeWidth="4"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <path
            d="M26 20L32 14L38 20"
            stroke="#5EEAD4"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </span>
      <div className={textClassName}>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
          {label}
        </p>
        <p className="font-[family-name:var(--font-display)] text-xl leading-none tracking-tight text-slate-950">
          Vendorly
        </p>
      </div>
    </div>
  );
}
