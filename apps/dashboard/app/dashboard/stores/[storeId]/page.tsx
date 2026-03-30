import Link from "next/link";
import { fetchQuery } from "convex/nextjs";

import { api } from "@vendorly/convex";
import { StoreBanner } from "@vendorly/ui";
import {
  getStoreSocialLinks,
  MARKETPLACE_URL,
  normalizeThemeColor,
  type ChatThread,
  type Order,
  type Product,
} from "@vendorly/utils";

import { StoreRouteSidebar } from "@/components/store-route-sidebar";
import { getOwnedDashboardStore } from "@/lib/dashboard-stores";

type DashboardStoreDetailsPageProps = {
  params: Promise<{
    storeId: string;
  }>;
};

export default async function DashboardStoreDetailsPage({
  params,
}: DashboardStoreDetailsPageProps) {
  const { storeId } = await params;
  const { currentUser, convexOptions, store, stores } =
    await getOwnedDashboardStore(storeId);
  const [products, orders, storeChatThreads] = await Promise.all([
    fetchQuery(
      api.products.getProductsByStore,
      {
        storeId: store._id,
      },
      convexOptions,
    ) as Promise<Product[]>,
    fetchQuery(
      api.orders.getOrdersByOwner,
      {
        ownerId: currentUser.id,
        storeId: store._id,
      },
      convexOptions,
    ) as Promise<Order[]>,
    fetchQuery(
      api.chat.getOwnerStoreChatThreads,
      {
        ownerId: currentUser.id,
        storeId: store._id,
      },
      convexOptions,
    ) as Promise<ChatThread[]>,
  ]);
  const previewUrl = `${MARKETPLACE_URL}/store/${store.slug}`;
  const socialLinks = getStoreSocialLinks(store);

  return (
    <main className="mx-auto max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
        <StoreRouteSidebar activeStoreId={store._id} stores={stores} />

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Store details
                </p>
                <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950 sm:text-6xl">
                  {store.name}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                  Review this storefront on its own page, then jump into edit
                  mode or the main dashboard workspace whenever you need to make
                  changes.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/dashboard?store=${store._id}`}
                  className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                >
                  Manage workspace
                </Link>
                <Link
                  href={`/dashboard/stores/${store._id}/edit`}
                  className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                >
                  Edit storefront
                </Link>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Preview live store
                </a>
              </div>
            </div>
          </section>

          <StoreBanner
            bannerImage={store.bannerImage}
            description={store.description}
            logoImage={store.logoImage}
            name={store.name}
            themeColor={store.themeColor}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Products
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {products.length}
              </p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Orders
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {orders.length}
              </p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Inbox threads
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {storeChatThreads.length}
              </p>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Brand story
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Store copy
              </h2>

              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Description
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {store.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Bio
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {store.bio?.trim() || "No store bio yet."}
                  </p>
                </div>
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Store settings
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Identity
                </h2>

                <dl className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Slug
                    </dt>
                    <dd className="mt-3 break-all text-sm font-medium text-slate-950">
                      {store.slug}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Layout
                    </dt>
                    <dd className="mt-3 text-sm font-medium text-slate-950">
                      {store.layoutType === "grid"
                        ? "Grid storefront"
                        : "List storefront"}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Theme color
                    </dt>
                    <dd className="mt-3 flex items-center gap-3 text-sm font-medium text-slate-950">
                      <span
                        className="h-4 w-4 rounded-full border border-slate-300"
                        style={{
                          backgroundColor: normalizeThemeColor(store.themeColor),
                        }}
                      />
                      {normalizeThemeColor(store.themeColor)}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Social links
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Outbound links
                </h2>

                <div className="mt-6 space-y-3">
                  {socialLinks.length > 0 ? (
                    socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                      >
                        <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          {link.label}
                        </span>
                        <span className="mt-3 block break-all font-medium text-slate-950">
                          {link.url}
                        </span>
                      </a>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                      No social links added yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
