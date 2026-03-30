"use client";

import { signOut, useSession } from "next-auth/react";

import { Navbar } from "@vendorly/ui";

import { useCart } from "@/lib/cart";

export function WebNavbar({ dashboardUrl }: { dashboardUrl: string }) {
  const cart = useCart();
  const { data: session } = useSession();

  return (
    <Navbar
      badge="Vendorly shop"
      ctaHref={dashboardUrl}
      ctaLabel="Seller dashboard"
      links={[
        { href: "/", label: "Shop" },
        { href: "/#stores", label: "Stores" },
        { href: "/#products", label: "Products" },
        { href: "/feed", label: "Feed" },
      ]}
      rightAccessory={
        <div className="flex items-center gap-3">
          {session?.user?.id ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
            >
              Sign out
            </button>
          ) : (
            <a
              href="/login"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
            >
              Sign in
            </a>
          )}
          <button
            type="button"
            onClick={cart.openCart}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
          >
            Cart
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
              {cart.itemCount}
            </span>
          </button>
        </div>
      }
    />
  );
}
