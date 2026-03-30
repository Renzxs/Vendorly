"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@vendorly/convex";
import { StoreCard } from "@vendorly/ui";
import type { MarketplaceProduct, Store } from "@vendorly/utils";

import { ProductSocialCard } from "./product-social-card";
import { useViewerId } from "@/lib/use-viewer-id";

function SectionTitle({
  eyebrow,
  title,
  body,
}: {
  body: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
        {body}
      </p>
    </div>
  );
}

function LoadingStoreGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function LoadingProductGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white" />
          <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <h3 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
    </div>
  );
}

export function MarketplaceShell() {
  const viewerId = useViewerId();
  const stores = useQuery(api.stores.getStores, {}) as Store[] | undefined;
  const products = useQuery(api.products.getMarketplaceProducts, {
    viewerId: viewerId ?? undefined,
  }) as MarketplaceProduct[] | undefined;
  const dashboardUrl =
    process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001/dashboard";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const featuredStores = useMemo(() => (stores ?? []).slice(0, 3), [stores]);
  const filteredProducts = useMemo(() => {
    return (products ?? []).filter((product) => {
      const matchesSearch =
        !deferredSearchTerm ||
        `${product.title} ${product.description} ${product.store?.name ?? ""}`
          .toLowerCase()
          .includes(deferredSearchTerm.toLowerCase());
      const matchesStore =
        selectedStore === "all" || product.store?._id === selectedStore;

      return matchesSearch && matchesStore;
    });
  }, [deferredSearchTerm, products, selectedStore]);

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Vendorly marketplace
            </p>
            <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950 sm:text-6xl">
              Shop storefronts with a familiar ecommerce flow.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Browse products, filter by seller, chat with stores, and keep your
              cart moving without having to fight through oversized bento
              panels.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#products"
                className="inline-flex items-center rounded-xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Shop products
              </a>
              <a
                href="/feed"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
              >
                View feed
              </a>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Products
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {products?.length ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Stores
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {stores?.length ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Seller tools
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Launch and manage stores from the admin dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-8 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Featured stores
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Shop by brand
                </h2>
              </div>
              <a
                href={dashboardUrl}
                className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
              >
                Become a seller
              </a>
            </div>
            <div className="mt-6 space-y-4">
              {(featuredStores.length > 0 ? featuredStores : (stores ?? []))
                .slice(0, 3)
                .map((store) => (
                  <a
                    key={store._id}
                    href={`/store/${store.slug}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {store.name}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                          {store.description}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {store.layoutType}
                      </span>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section id="stores" className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Featured stores"
            title="Brands with their own storefront identity"
            body="Use the same marketplace, but land shoppers in a cleaner, store-first experience instead of a stacked editorial wall."
          />
          <a
            href={dashboardUrl}
            className="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300"
          >
            Open seller dashboard
          </a>
        </div>

        <div className="mt-6">
          {stores === undefined ? (
            <LoadingStoreGrid />
          ) : featuredStores.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredStores.map((store) => (
                <StoreCard key={store._id} store={store} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No stores yet"
              body="Create your first seller storefront in the dashboard to bring the marketplace to life."
            />
          )}
        </div>
      </section>

      <section id="products" className="mt-12">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Filters
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Narrow your shopping view
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Search products, jump to a specific storefront, and keep the
              catalog focused on what shoppers actually want to see.
            </p>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Search
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products or stores"
                  value={searchTerm}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Store
                </span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
                  onChange={(event) => setSelectedStore(event.target.value)}
                  value={selectedStore}
                >
                  <option value="all">All storefronts</option>
                  {(stores ?? []).map((store) => (
                    <option key={store._id} value={store._id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Results
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {filteredProducts.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Store filter
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedStore === "all"
                    ? "Browsing across every storefront."
                    : ((stores ?? []).find(
                        (store) => store._id === selectedStore,
                      )?.name ?? "Selected storefront")}
                </p>
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle
                eyebrow="Products"
                title="Catalog"
                body="A standard storefront grid keeps more products visible on screen and makes browsing feel faster."
              />
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                Showing {filteredProducts.length} item
                {filteredProducts.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-6">
              {products === undefined ? (
                <LoadingProductGrid />
              ) : filteredProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductSocialCard
                      key={product._id}
                      layout="grid"
                      product={product}
                      viewerId={viewerId}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No products match that search"
                  body="Try another keyword or filter. Once products are created in the seller dashboard, they appear here automatically."
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
