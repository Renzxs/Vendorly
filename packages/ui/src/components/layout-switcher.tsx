import type { LayoutType } from "@vendorly/utils";
import { cn, LAYOUT_OPTIONS } from "@vendorly/utils";

type LayoutSwitcherProps = {
  className?: string;
  onChange?: (layout: LayoutType) => void;
  value: LayoutType;
};

export function LayoutSwitcher({
  className,
  onChange,
  value,
}: LayoutSwitcherProps) {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2",
        className,
      )}
    >
      {LAYOUT_OPTIONS.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={cn(
              "rounded-xl border px-4 py-4 text-left transition",
              active
                ? "border-transparent bg-white shadow-sm"
                : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white",
            )}
            style={
              active
                ? {
                    boxShadow:
                      "inset 0 0 0 1px color-mix(in srgb, var(--vendorly-theme) 35%, white)",
                  }
                : undefined
            }
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={cn(
                  "rounded-md border border-slate-200 bg-slate-100",
                  option.value === "grid" ? "h-8 w-10" : "h-8 w-16",
                )}
              />
              <span className="text-sm font-semibold text-slate-950">
                {option.label}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
