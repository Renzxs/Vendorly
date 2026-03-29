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
    <section className="space-y-5">
      <div className="border-b border-black/10 pb-4">
        <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function FeedLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse border border-black/10 bg-[rgba(255,253,247,0.86)]"
        />
      ))}
    </div>
  );
}

function EmptyFeedState() {
  return (
    <div className="border border-dashed border-slate-400 bg-[rgba(255,253,247,0.88)] p-8 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
        No products in the feed yet
      </h2>
      <p className="mt-4 text-sm leading-8 text-slate-600">
        Once sellers add products, the freshest drops and followed-store updates will appear here.
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
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <section className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-6 sm:p-8">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-teal-700">
          Vendorly product feed
        </p>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950 sm:text-6xl">
          Fresh drops, reactions, and followed-store updates in one feed.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          Follow the storefronts you care about and react to standout products.
          The feed surfaces followed-store drops first, then the latest across the marketplace.
        </p>
      </section>

      <div className="mt-10 space-y-12">
        {feed === undefined ? (
          <FeedLoading />
        ) : feed.length === 0 ? (
          <EmptyFeedState />
        ) : (
          <>
            {followedDrops.length > 0 ? (
              <FeedSection
                title="From stores you follow"
                description="New or lively products from the storefronts you chose to keep up with."
              >
                <div className="space-y-5">
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
              title={followedDrops.length > 0 ? "Latest across Vendorly" : "Marketplace feed"}
              description={
                followedDrops.length > 0
                  ? "Everything else happening across the marketplace right now."
                  : "The latest products and the most-reacted items from every Vendorly storefront."
              }
            >
              <div className="space-y-5">
                {(followedDrops.length > 0 ? latestDrops : feed).map((product) => (
                  <ProductSocialCard
                    key={product._id}
                    layout="list"
                    product={product}
                    viewerId={viewerId}
                  />
                ))}
              </div>
            </FeedSection>
          </>
        )}
      </div>
    </main>
  );
}
