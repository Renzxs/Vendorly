"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  DEFAULT_CHECKOUT_FORM,
  ORDER_PAYMENT_METHOD_OPTIONS,
  calculateShippingFee,
  formatCurrency,
  type CheckoutFormValues,
} from "@vendorly/utils";

import { checkoutAction } from "@/app/cart/actions";
import { useCart } from "@/lib/cart";

export function CartPageShell() {
  const cart = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormValues>(
    DEFAULT_CHECKOUT_FORM,
  );
  const [checkoutStatus, setCheckoutStatus] = useState<{
    kind: "error" | "success";
    message: string;
  } | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  useEffect(() => {
    setCheckoutForm((current) => ({
      ...current,
      email: current.email || session?.user?.email || "",
      fullName: current.fullName || session?.user?.name || "",
    }));
  }, [session?.user?.email, session?.user?.name]);

  const storeOrderSummary = useMemo(() => {
    const grouped = new Map<
      string,
      {
        shippingFee: number;
        storeName: string;
        subtotal: number;
      }
    >();

    for (const item of cart.items) {
      const existing = grouped.get(item.storeId) ?? {
        shippingFee: 0,
        storeName: item.storeName ?? "Vendorly store",
        subtotal: 0,
      };

      existing.subtotal += item.price * item.quantity;
      existing.shippingFee = calculateShippingFee(existing.subtotal);
      grouped.set(item.storeId, existing);
    }

    return Array.from(grouped.values());
  }, [cart.items]);

  const shippingTotal = storeOrderSummary.reduce(
    (total, group) => total + group.shippingFee,
    0,
  );
  const grandTotal = cart.total + shippingTotal;

  function updateCheckoutForm<Field extends keyof CheckoutFormValues>(
    field: Field,
    value: CheckoutFormValues[Field],
  ) {
    setCheckoutForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCheckout() {
    startTransition(async () => {
      setCheckoutStatus(null);

      const result = await checkoutAction({
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: checkoutForm,
      });

      setCheckoutStatus({
        kind: result.success ? "success" : "error",
        message: result.message,
      });

      if (!result.success) {
        return;
      }

      cart.clearCart();
      router.push("/orders?placed=1");
    });
  }

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Checkout
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950">
            Review your order
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Choose a payment method, enter delivery details, and place store
            orders that you can track later from your account.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300"
          >
            Track orders
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300"
          >
            Continue shopping
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {cart.items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <p className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                  Your cart is empty
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Add products from the marketplace or a storefront to start a
                  checkout.
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
                            {formatCurrency(item.price)}
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

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="border-b border-slate-200 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Delivery details
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Shipping information
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Checkout creates separate orders per store so sellers can manage
                shipping and fulfillment independently.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Full name
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("fullName", event.target.value)
                  }
                  value={checkoutForm.fullName}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Email
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("email", event.target.value)
                  }
                  type="email"
                  value={checkoutForm.email}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Phone
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("phone", event.target.value)
                  }
                  value={checkoutForm.phone}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Country
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("country", event.target.value)
                  }
                  value={checkoutForm.country}
                />
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Address line 1
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("addressLine1", event.target.value)
                  }
                  value={checkoutForm.addressLine1}
                />
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Address line 2
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("addressLine2", event.target.value)
                  }
                  value={checkoutForm.addressLine2}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  City
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("city", event.target.value)
                  }
                  value={checkoutForm.city}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  State or province
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("stateProvince", event.target.value)
                  }
                  value={checkoutForm.stateProvince}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Postal code
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("postalCode", event.target.value)
                  }
                  value={checkoutForm.postalCode}
                />
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Delivery notes
                </span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) =>
                    updateCheckoutForm("notes", event.target.value)
                  }
                  placeholder="Building, landmarks, preferred delivery time, or other notes."
                  value={checkoutForm.notes}
                />
              </label>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Payment method
            </p>
            <div className="mt-5 space-y-3">
              {ORDER_PAYMENT_METHOD_OPTIONS.map((option) => {
                const active = checkoutForm.paymentMethod === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateCheckoutForm("paymentMethod", option.value)
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p
                          className={`mt-2 text-sm leading-6 ${
                            active ? "text-white/75" : "text-slate-600"
                          }`}
                        >
                          {option.description}
                        </p>
                      </div>
                      <span
                        className={`mt-1 h-4 w-4 rounded-full border ${
                          active ? "border-white bg-white" : "border-slate-300"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Order summary
            </p>
            <div className="mt-5 space-y-4">
              {storeOrderSummary.map((group) => (
                <div
                  key={group.storeName}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {group.storeName}
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-4">
                      <span>Items</span>
                      <span>{formatCurrency(group.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Shipping</span>
                      <span>
                        {group.shippingFee === 0
                          ? "Free"
                          : formatCurrency(group.shippingFee)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <span>Items subtotal</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Total shipping</span>
                  <span>
                    {shippingTotal === 0
                      ? "Free"
                      : formatCurrency(shippingTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-base font-semibold text-slate-950">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {checkoutStatus ? (
              <div
                className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                  checkoutStatus.kind === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {checkoutStatus.message}
              </div>
            ) : null}

            <button
              type="button"
              disabled={isSubmitting || cart.items.length === 0}
              onClick={handleCheckout}
              className="mt-6 inline-flex w-full justify-center rounded-xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Placing order..." : "Place order"}
            </button>
            <button
              type="button"
              onClick={cart.clearCart}
              disabled={cart.items.length === 0}
              className="mt-3 inline-flex w-full justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear cart
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
