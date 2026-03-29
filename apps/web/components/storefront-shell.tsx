"use client";

import { useState, useTransition } from "react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";

import { api } from "@vendorly/convex";
import { StoreBanner, ThemeWrapper } from "@vendorly/ui";
import { getInitials, getStoreSocialLinks, type Product, type Store } from "@vendorly/utils";

import { useStoreChat } from "@/lib/store-chat";
import { useViewerId } from "@/lib/use-viewer-id";
import { ProductSocialCard } from "./product-social-card";

function StorefrontLoading() {
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

function StoreProducts({
  layoutType,
  storeId,
  storeName,
  storeSlug,
  themeColor,
  viewerId,
}: {
  layoutType: "grid" | "list";
  storeId: string;
  storeName: string;
  storeSlug: string;
  themeColor: string;
  viewerId?: string | null;
}) {
  const products = useQuery(api.products.getProductsByStore, {
    storeId,
    viewerId: viewerId ?? undefined,
  }) as Product[] | undefined;

  if (products === undefined) {
    return <StorefrontLoading />;
  }

  if (products.length === 0) {
    return (
      <div className="border border-dashed border-slate-400 bg-[rgba(255,253,247,0.88)] p-10 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
          This storefront is ready for its first drop.
        </h2>
        <p className="mt-4 text-sm leading-8 text-slate-600">
          Products added in the Vendorly dashboard will show up here instantly.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        layoutType === "grid"
          ? "grid gap-5 lg:grid-cols-2"
          : "space-y-5"
      }
    >
      {products.map((product) => (
        <ProductSocialCard
          key={product._id}
          layout={layoutType}
          product={product}
          storeName={storeName}
          storeSlug={storeSlug}
          themeColor={themeColor}
          viewerId={viewerId}
        />
      ))}
    </div>
  );
}

export function StorefrontShell({ slug }: { slug: string }) {
  const storeChat = useStoreChat();
  const viewerId = useViewerId();
  const store = useQuery(api.stores.getStoreBySlug, {
    slug,
    viewerId: viewerId ?? undefined,
  }) as Store | null | undefined;
  const toggleStoreFollow = useMutation(api.stores.toggleStoreFollow);
  const dashboardUrl =
    process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001/dashboard";
  const [isPending, startTransition] = useTransition();
  const [followError, setFollowError] = useState<string | null>(null);
  const socialLinks = store ? getStoreSocialLinks(store) : [];

  if (store === undefined) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <StorefrontLoading />
      </main>
    );
  }

  if (store === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="border border-dashed border-slate-400 bg-[rgba(255,253,247,0.9)] p-10">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500">
            Store not found
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950">
            This Vendorly storefront doesn&apos;t exist yet.
          </h1>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            Double-check the URL or create the store from the seller dashboard.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  function handleToggleFollow() {
    if (!viewerId || !store) {
      return;
    }

    const storeId = store._id;

    startTransition(async () => {
      try {
        setFollowError(null);
        await toggleStoreFollow({
          storeId,
          viewerId,
        });
      } catch (error) {
        setFollowError(
          error instanceof Error ? error.message : "Unable to update follow state.",
        );
      }
    });
  }

  return (
    <ThemeWrapper themeColor={store.themeColor}>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-b border-slate-900 pb-1 text-sm font-medium text-slate-700 transition hover:text-slate-950"
          >
            Back to marketplace
          </Link>
          <div className="flex flex-wrap gap-3">
            <span className="border border-black/10 bg-[rgba(255,253,247,0.88)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
              {store.layoutType} layout
            </span>
            <span className="border border-black/10 bg-[rgba(255,253,247,0.88)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
              {store.followerCount ?? 0} follower
              {(store.followerCount ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <StoreBanner
          bannerImage={store.bannerImage}
          description={store.description}
          logoImage={store.logoImage}
          name={store.name}
          themeColor={store.themeColor}
        />

        <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            <div className="border-b border-black/10 pb-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-500">
                Storefront catalog
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950">
                Browse the current collection.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600">
                This page renders live from the seller&apos;s current storefront configuration, follow state, and product reactions.
              </p>
            </div>
            <StoreProducts
              layoutType={store.layoutType}
              storeId={store._id}
              storeName={store.name}
              storeSlug={store.slug}
              themeColor={store.themeColor}
              viewerId={viewerId}
            />
          </div>

          <aside className="space-y-6">
            <div className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                About this store
              </p>
              <div className="mt-5 flex items-start gap-4">
                {store.logoImage ? (
                  <img
                    alt={`${store.name} logo`}
                    className="h-20 w-20 border border-black/10 object-cover"
                    src={store.logoImage}
                  />
                ) : (
                  <div
                    className="inline-flex h-20 w-20 items-center justify-center border border-black/10 text-lg font-semibold text-white"
                    style={{ backgroundColor: store.themeColor }}
                  >
                    {getInitials(store.name)}
                  </div>
                )}
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                    {store.name}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {store.description}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-8 text-slate-600">
                {store.bio ||
                  "This seller has not added a longer brand bio yet. Their short storefront description appears above."}
              </p>
              {socialLinks.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-black/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 transition hover:border-slate-400 hover:text-slate-950"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="border border-black/10 bg-[rgba(255,253,247,0.92)] p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                Store actions
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950">
                Follow and revisit this storefront later.
              </h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                Follows now persist to Convex for this browser session, and your
                product feed can prioritize stores you follow.
              </p>
              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() =>
                    storeChat.openChat({
                      storeId: store._id,
                      storeName: store.name,
                      storeSlug: store.slug,
                      themeColor: store.themeColor,
                    })
                  }
                  className="inline-flex w-full justify-center border border-black/10 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400"
                >
                  Chat with store
                </button>
                <button
                  type="button"
                  disabled={isPending || !viewerId}
                  onClick={handleToggleFollow}
                  className={`inline-flex w-full justify-center border px-5 py-3 text-sm font-medium transition ${
                    store.isFollowed
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-black/10 bg-white text-slate-900 hover:border-slate-400"
                  } ${isPending || !viewerId ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {store.isFollowed ? "Following store" : "Follow store"}
                </button>
              </div>
              {followError ? (
                <p className="mt-3 text-sm text-rose-600">{followError}</p>
              ) : null}
            </div>

            <div className="border border-black/10 bg-slate-950 p-6 text-white">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/55">
                Build your own
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight">
                Open the Vendorly dashboard and launch your branded storefront.
              </h2>
              <a
                href={dashboardUrl}
                className="mt-6 inline-flex border border-white bg-white px-5 py-3 text-sm font-medium text-slate-950"
              >
                Go to dashboard
              </a>
            </div>
          </aside>
        </section>
      </main>
    </ThemeWrapper>
  );
}
