import type { CSSProperties, ReactNode } from "react";

import { cn, normalizeThemeColor } from "@vendorly/utils";

type ThemeWrapperProps = {
  as?: "article" | "div" | "section";
  children: ReactNode;
  className?: string;
  themeColor?: string;
};

export function ThemeWrapper({
  as = "div",
  children,
  className,
  themeColor,
}: ThemeWrapperProps) {
  const Component = as;
  const style = {
    "--vendorly-theme": normalizeThemeColor(themeColor),
  } as CSSProperties;

  return (
    <Component className={cn("vendorly-theme", className)} style={style}>
      {children}
    </Component>
  );
}

