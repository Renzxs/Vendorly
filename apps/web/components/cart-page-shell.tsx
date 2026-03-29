"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart";

export function CartPageShell() {
  const cart = useCart();

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="border border-black/10 bg-[rgba(255,253,247,0.92)]">
        <div className="border-b border-black/10 px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500">
                Vendorly cart
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950">
                Your picks
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600">
                Review everything you&apos;ve added before checkout is ready.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400"
            >
              Keep browsing
            </Link>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="p-6 sm:p-8">
            <div className="border border-dashed border-slate-400 bg-white p-10 text-center">
              <p className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                Your cart is empty
              </p>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                Add products from the marketplace or a storefront to see them here.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 p-6 sm:p-8">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="border border-black/10 bg-white p-4 sm:p-5"
                >
                  <div className="flex gap-4">
                    {item.image ? (
                      <img
                        alt={item.title}
                        className="h-24 w-24 border border-black/10 object-cover"
                        src={item.image}
                      />
                    ) : (
                      <div className="h-24 w-24 border border-black/10 bg-slate-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-950">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.storeName ?? "Vendorly store"}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            cart.updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="border border-black/10 px-3 py-2 text-sm text-slate-900"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium text-slate-700">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            cart.updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="border border-black/10 px-3 py-2 text-sm text-slate-900"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => cart.removeItem(item.productId)}
                          className="ml-auto border-b border-slate-900 pb-1 text-sm font-medium text-slate-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-black/10 px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}
                </span>
                <span className="font-semibold text-slate-950">
                  ${cart.total.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                className="mt-4 inline-flex w-full justify-center border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Checkout coming soon
              </button>
              <button
                type="button"
                onClick={cart.clearCart}
                className="mt-3 inline-flex w-full justify-center border border-black/10 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
