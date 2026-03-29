"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { ConvexProvider, ConvexReactClient } from "convex/react";

type VendorlyConvexProviderProps = {
  children: ReactNode;
};

function MissingConvexState() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-20">
      <div className="rounded-[2rem] border border-amber-200 bg-white p-8 shadow-xl">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-600">
          Convex setup needed
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Add NEXT_PUBLIC_CONVEX_URL to keep Vendorly in sync.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Start Convex with <code>npm run dev:convex</code>, copy the local
          deployment URL into each app&apos;s <code>.env.local</code>, then
          reload the app.
        </p>
      </div>
    </div>
  );
}

export function VendorlyConvexProvider({
  children,
}: VendorlyConvexProviderProps) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(
    () => (url ? new ConvexReactClient(url) : null),
    [url],
  );

  if (!client) {
    return <MissingConvexState />;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

