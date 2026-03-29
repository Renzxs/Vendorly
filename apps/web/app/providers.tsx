"use client";

import type { ReactNode } from "react";

import { VendorlyConvexProvider } from "@vendorly/convex";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <VendorlyConvexProvider>{children}</VendorlyConvexProvider>;
}

