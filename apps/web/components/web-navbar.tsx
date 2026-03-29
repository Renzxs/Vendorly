"use client";

import { signOut, useSession } from "next-auth/react";

import { Navbar } from "@vendorly/ui";

import { useCart } from "@/lib/cart";

export function WebNavbar({ dashboardUrl }: { dashboardUrl: string }) {
  const cart = useCart();
  const { data: session } = useSession();

  return (
    <Navbar
      badge="Storefront marketplace"
      ctaHref={dashboardUrl}
      ctaLabel="Seller dashboard"
      links={[
        { href: "/", label: "Marketplace" },
        { href: "/feed", label: "Product feed" },
        { href: "/#stores", label: "Featured stores" },
        { href: "/#products", label: "Products" },
      ]}
      rightAccessory={
        <div className="flex items-center gap-3">
          {session?.user?.id ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center border border-black/10 bg-[rgba(255,253,247,0.94)] px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400"
            >
              Sign out
            </button>
          ) : (
            <a
              href="/login"
              className="inline-flex items-center border border-black/10 bg-[rgba(255,253,247,0.94)] px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400"
            >
              Sign in
            </a>
          )}
          <button
            type="button"
            onClick={cart.openCart}
            className="inline-flex items-center gap-2 border border-black/10 bg-[rgba(255,253,247,0.94)] px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400"
          >
            Cart
            <span className="border border-black/10 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
              {cart.itemCount}
            </span>
          </button>
        </div>
      }
    />
  );
}
