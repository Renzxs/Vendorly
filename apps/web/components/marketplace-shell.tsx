"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@vendorly/convex";
import { StoreCard } from "@vendorly/ui";
import type { MarketplaceProduct, Store } from "@vendorly/utils";

import { ProductSocialCard } from "./product-social-card";
import { useViewerId } from "@/lib/use-viewer-id";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-teal-700">
        {eyebrow}
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function LoadingRail() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse border border-black/10 bg-[rgba(255,253,247,0.86)]"
        />
      ))}
    </div>
  );
}

function EmptyState({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  return (
    <div className="border border-dashed border-slate-400 bg-[rgba(255,253,247,0.88)] p-8 text-center">
      <h3 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-8 text-slate-600">{body}</p>
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
    <main className="pb-24">
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <div className="space-y-8">
              <div className="inline-flex border border-black/10 bg-[rgba(255,253,247,0.9)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500">
                Vendorly marketplace
              </div>
              <div className="space-y-6">
                <h1 className="max-w-5xl font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Commerce that feels curated, not crowded.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  Buyers browse standout products and seller-run storefronts in a
                  calmer, more editorial marketplace. Follow stores, react to
                  products, and keep tabs on new drops from brands you care about.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Browse products
                </a>
                <a
                  href="/feed"
                  className="inline-flex items-center border border-black/10 bg-[rgba(255,253,247,0.9)] px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400"
                >
                  Open product feed
                </a>
              </div>
            </div>
            <div className="border border-black/10 bg-[rgba(255,253,247,0.92)]">
              <div className="border-b border-black/10 px-6 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  Live marketplace snapshot
                </p>
              </div>
              <div className="grid sm:grid-cols-2">
                <div className="border-b border-black/10 px-6 py-6 sm:border-b-0 sm:border-r">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Featured products
                  </p>
                  <p className="mt-4 font-[family-name:var(--font-display)] text-6xl leading-none tracking-tight text-slate-950">
                    {products?.length ?? 0}
                  </p>
                </div>
                <div className="px-6 py-6">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Live storefronts
                  </p>
                  <p className="mt-4 font-[family-name:var(--font-display)] text-6xl leading-none tracking-tight text-slate-950">
                    {stores?.length ?? 0}
                  </p>
                </div>
              </div>
              <div className="border-t border-black/10 bg-slate-950 px-6 py-6 text-white">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/55">
                  Seller-first setup
                </p>
                <p className="mt-4 max-w-md text-sm leading-8 text-white/78">
                  Multi-store ownership, OAuth login, dynamic storefront themes, and
                  a product editor that supports URL images or uploaded files in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="stores"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Featured stores"
            title="Independent brand worlds with their own rhythm."
            description="Each seller gets a dedicated storefront with banner imagery, custom accent color, and a layout that can shift between a catalog grid and a product-led list."
          />
          <a
            href={dashboardUrl}
            className="inline-flex w-fit border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Launch your store
          </a>
        </div>
        <div className="mt-10">
          {stores === undefined ? (
            <LoadingRail />
          ) : featuredStores.length > 0 ? (
            <div className="space-y-4">
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

      <section id="products" className="border-t border-black/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Marketplace products"
              title="A calmer product rail with live reactions."
              description="Search across titles, descriptions, and store names, then filter down to a specific storefront. Follow the stores you love and react to their latest drops."
            />
            <div className="w-full max-w-xl border border-black/10 bg-[rgba(255,253,247,0.92)]">
              <div className="grid gap-0 lg:grid-cols-[1fr_220px]">
                <label className="border-b border-black/10 px-5 py-4 lg:border-b-0 lg:border-r">
                  <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Search products
                  </span>
                  <input
                    className="w-full border-0 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search candles, notebooks, slings..."
                    value={searchTerm}
                  />
                </label>
                <label className="px-5 py-4">
                  <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Filter by store
                  </span>
                  <select
                    className="w-full border-0 bg-transparent text-sm text-slate-950 outline-none"
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
            </div>
          </div>

          <div className="mt-10">
            {products === undefined ? (
              <LoadingRail />
            ) : filteredProducts.length > 0 ? (
              <div className="space-y-5">
                {filteredProducts.map((product) => (
                  <ProductSocialCard
                    key={product._id}
                    layout="list"
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
      </section>
    </main>
  );
}
