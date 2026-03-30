"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useQuery } from "convex/react";

import { api } from "@vendorly/convex";
import type { MarketplaceProduct } from "@vendorly/utils";

import { ProductSocialCard } from "./product-social-card";
import { useViewerId } from "@/lib/use-viewer-id";

function FeedSection({
  description,
  title,
  children,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FeedLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function EmptyFeedState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
        No products in the feed yet
      </h2>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        Once sellers add products, the freshest drops and followed-store updates
        will appear here.
      </p>
    </div>
  );
}

export function ProductFeedShell() {
  const viewerId = useViewerId();
  const feed = useQuery(api.products.getProductFeed, {
    viewerId: viewerId ?? undefined,
  }) as MarketplaceProduct[] | undefined;

  const followedDrops = useMemo(
    () => (feed ?? []).filter((product) => product.fromFollowedStore),
    [feed],
  );
  const latestDrops = useMemo(
    () => (feed ?? []).filter((product) => !product.fromFollowedStore),
    [feed],
  );

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Product feed
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950 sm:text-6xl">
              Track new drops without the clutter.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              Follow stores, review their latest products, and jump into a
              cleaner activity feed built around shopping decisions.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total feed items
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {feed?.length ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Followed stores
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {followedDrops.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-6">
        {feed === undefined ? (
          <FeedLoading />
        ) : feed.length === 0 ? (
          <EmptyFeedState />
        ) : (
          <>
            {followedDrops.length > 0 ? (
              <FeedSection
                title="From stores you follow"
                description="Fresh products and active items from the storefronts you chose to keep up with."
              >
                <div className="space-y-4">
                  {followedDrops.map((product) => (
                    <ProductSocialCard
                      key={product._id}
                      layout="list"
                      product={product}
                      viewerId={viewerId}
                    />
                  ))}
                </div>
              </FeedSection>
            ) : null}

            <FeedSection
              title={
                followedDrops.length > 0
                  ? "Latest across Vendorly"
                  : "Marketplace feed"
              }
              description={
                followedDrops.length > 0
                  ? "Everything else happening across the marketplace right now."
                  : "The newest products and most active listings from every Vendorly storefront."
              }
            >
              <div className="space-y-4">
                {(followedDrops.length > 0 ? latestDrops : feed).map(
                  (product) => (
                    <ProductSocialCard
                      key={product._id}
                      layout="list"
                      product={product}
                      viewerId={viewerId}
                    />
                  ),
                )}
              </div>
            </FeedSection>
          </>
        )}
      </div>
    </main>
  );
}
