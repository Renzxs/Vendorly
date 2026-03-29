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
        "grid gap-3 border border-black/10 bg-[rgba(255,253,247,0.94)] p-3 sm:grid-cols-2",
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
              "border px-4 py-4 text-left transition",
              active
                ? "bg-white"
                : "border-black/10 bg-transparent hover:border-slate-400 hover:bg-white/70",
            )}
            style={
              active
                ? {
                    borderColor: "var(--vendorly-theme)",
                    boxShadow:
                      "inset 0 0 0 1px color-mix(in srgb, var(--vendorly-theme) 34%, white)",
                  }
                : undefined
            }
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={cn(
                  "border border-black/10 bg-slate-100",
                  option.value === "grid" ? "h-8 w-10" : "h-8 w-16",
                )}
              />
              <span className="text-sm font-semibold text-slate-950">
                {option.label}
              </span>
            </div>
            <p className="text-sm text-slate-600">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
