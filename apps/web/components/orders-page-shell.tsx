import Link from "next/link";

import {
  formatCurrency,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  type Order,
} from "@vendorly/utils";

function formatOrderDate(value?: number) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getOrderStatusClasses(status: Order["orderStatus"]) {
  if (status === "delivered") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "cancelled") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (status === "shipped") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getPaymentStatusClasses(status: Order["paymentStatus"]) {
  if (status === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "cod_due") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getPaymentMethodLabel(method: Order["paymentMethod"]) {
  if (method === "card") {
    return "Card payment";
  }

  if (method === "online") {
    return "Online transfer";
  }

  return "Cash on delivery";
}

export function OrdersPageShell({
  orders,
  placed,
}: {
  orders: Order[];
  placed?: boolean;
}) {
  return (
    <main className="mx-auto max-w-[80rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Orders
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950 sm:text-5xl">
            Track your orders
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Review payment method, fulfillment progress, shipping details, and
            the order timeline for every store you checked out from.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300"
        >
          Continue shopping
        </Link>
      </div>

      {placed ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">
          Your order was placed successfully. If your cart had items from
          multiple stores, Vendorly created a separate tracked order for each
          store.
        </div>
      ) : null}

      <section className="mt-8">
        {orders.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <h2 className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-slate-950">
              No orders yet
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Place your first order from the cart to start tracking shipping,
              payment, and delivery updates here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Order {order.orderCode}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {order.storeName}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Placed {formatOrderDate(order._creationTime)}
                    </p>
                    {order.store?.slug ? (
                      <Link
                        href={`/store/${order.store.slug}`}
                        className="mt-3 inline-flex text-sm font-medium text-slate-700 transition hover:text-slate-950"
                      >
                        Visit storefront
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getOrderStatusClasses(order.orderStatus)}`}
                    >
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getPaymentStatusClasses(order.paymentStatus)}`}
                    >
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={`${order._id}-${item.productId}`}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          {item.productImage ? (
                            <img
                              alt={item.productTitle}
                              className="h-24 w-full rounded-2xl border border-slate-200 object-cover sm:w-24"
                              src={item.productImage}
                            />
                          ) : (
                            <div className="h-24 w-full rounded-2xl border border-slate-200 bg-white sm:w-24" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-lg font-semibold text-slate-950">
                              {item.productTitle}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                              Quantity {item.quantity}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-slate-950">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Order timeline
                      </p>
                      <div className="mt-4 space-y-4">
                        {order.statusHistory.map((entry, index) => (
                          <div
                            key={`${order._id}-${entry.at}-${index}`}
                            className="flex gap-3"
                          >
                            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-slate-900" />
                            <div>
                              <p className="text-sm font-medium text-slate-950">
                                {entry.label}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                                {formatOrderDate(entry.at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Delivery address
                      </p>
                      <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                        <p className="font-medium text-slate-950">
                          {order.shippingAddress.fullName}
                        </p>
                        <p>{order.shippingAddress.email}</p>
                        <p>{order.shippingAddress.phone}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 ? (
                          <p>{order.shippingAddress.addressLine2}</p>
                        ) : null}
                        <p>
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.stateProvince}{" "}
                          {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                        {order.shippingAddress.notes ? (
                          <p className="pt-2 text-slate-500">
                            Note: {order.shippingAddress.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Cost summary
                      </p>
                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-4">
                          <span>Subtotal</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span>Shipping</span>
                          <span>
                            {order.shippingFee === 0
                              ? "Free"
                              : formatCurrency(order.shippingFee)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                          <span>Total</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
