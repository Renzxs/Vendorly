"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart";

export function CartPageShell() {
  const cart = useCart();

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Cart
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950">
            Review your order
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Update quantities, remove items, and keep the checkout flow focused
            on the essentials.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300"
        >
          Continue shopping
        </Link>
      </div>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {cart.items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                Your cart is empty
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Add products from the marketplace or a storefront to see them
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {item.image ? (
                      <img
                        alt={item.title}
                        className="h-28 w-full rounded-2xl border border-slate-200 object-cover sm:w-28"
                        src={item.image}
                      />
                    ) : (
                      <div className="h-28 w-full rounded-2xl border border-slate-200 bg-white sm:w-28" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-slate-950">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.storeName ?? "Vendorly store"}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-slate-950">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              cart.updateQuantity(
                                item.productId,
                                item.quantity - 1,
                              )
                            }
                            className="px-4 py-2 text-sm font-medium text-slate-900"
                          >
                            -
                          </button>
                          <span className="border-x border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              cart.updateQuantity(
                                item.productId,
                                item.quantity + 1,
                              )
                            }
                            className="px-4 py-2 text-sm font-medium text-slate-900"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => cart.removeItem(item.productId)}
                          className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
                        >
                          Remove item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Order summary
          </p>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Items</span>
              <span className="font-medium text-slate-950">
                {cart.itemCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-950">
                ${cart.total.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-950">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 inline-flex w-full justify-center rounded-xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Checkout coming soon
          </button>
          <button
            type="button"
            onClick={cart.clearCart}
            className="mt-3 inline-flex w-full justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
          >
            Clear cart
          </button>
        </aside>
      </section>
    </main>
  );
}
