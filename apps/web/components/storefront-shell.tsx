"use client";

import { useState, useTransition } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";

import { api } from "@vendorly/convex";
import { StoreBanner, ThemeWrapper } from "@vendorly/ui";
import {
  getInitials,
  getStoreSocialLinks,
  type Product,
  type Store,
} from "@vendorly/utils";

import { toggleStoreFollowAction } from "@/app/actions/buyer";
import { getActionErrorMessage } from "@/lib/action-errors";
import { useStoreChat } from "@/lib/store-chat";
import { useViewerId } from "@/lib/use-viewer-id";
import { ProductSocialCard } from "./product-social-card";
import { StoreAiAssistant } from "./store-ai-assistant";

function StorefrontLoading() {
  return (
    <div className="grid gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-white"
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
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h2 className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-slate-950">
          This storefront is ready for its first drop.
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Products added in the Vendorly dashboard will show up here instantly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Product catalog
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Shop {storeName}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            {products.length} item{products.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 capitalize">
            {layoutType} layout
          </span>
        </div>
      </div>

      <div
        className={
          layoutType === "grid"
            ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-2"
            : "space-y-4"
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
  const dashboardUrl =
    process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001/dashboard";
  const [isPending, startTransition] = useTransition();
  const [followError, setFollowError] = useState<string | null>(null);
  const socialLinks = store ? getStoreSocialLinks(store) : [];
  const canBuyerAct = Boolean(viewerId);

  if (store === undefined) {
    return (
      <main className="mx-auto max-w-[80rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <StorefrontLoading />
      </main>
    );
  }

  if (store === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Store not found
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950 sm:text-5xl">
            This Vendorly storefront doesn&apos;t exist yet.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Double-check the URL or create the store from the seller dashboard.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  function handleToggleFollow() {
    if (!canBuyerAct || !store) {
      return;
    }

    const storeId = store._id;

    startTransition(async () => {
      try {
        setFollowError(null);
        const result = await toggleStoreFollowAction({
          storeId,
        });

        if (!result.success) {
          setFollowError(result.message);
        }
      } catch (error) {
        setFollowError(getActionErrorMessage(error, "Unable to update follow state."));
      }
    });
  }

  return (
    <ThemeWrapper themeColor={store.themeColor}>
      <main className="mx-auto max-w-[80rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            >
              Back to marketplace
            </Link>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              {store.followerCount ?? 0} follower
              {(store.followerCount ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canBuyerAct}
              onClick={() =>
                storeChat.openChat({
                  storeId: store._id,
                  storeName: store.name,
                  storeSlug: store.slug,
                  themeColor: store.themeColor,
                })
              }
              className={`inline-flex items-center rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
                !canBuyerAct
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
              }`}
            >
              Chat with store
            </button>
            <button
              type="button"
              disabled={isPending || !canBuyerAct}
              onClick={handleToggleFollow}
              className={`inline-flex items-center rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
                store.isFollowed
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
              } ${isPending || !canBuyerAct ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {store.isFollowed ? "Following" : "Follow store"}
            </button>
          </div>
        </div>

        <StoreBanner
          bannerImage={store.bannerImage}
          description={store.description}
          logoImage={store.logoImage}
          name={store.name}
          themeColor={store.themeColor}
        />

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Storefront overview
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Browse the current collection
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                This page stays in sync with the seller&apos;s live storefront,
                product catalog, follow state, and buyer-to-seller chat.
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

          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                About this store
              </p>
              <div className="mt-5 flex items-start gap-4">
                {store.logoImage ? (
                  <img
                    alt={`${store.name} logo`}
                    className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
                    src={store.logoImage}
                  />
                ) : (
                  <div
                    className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 text-sm font-semibold text-white"
                    style={{ backgroundColor: store.themeColor }}
                  >
                    {getInitials(store.name)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {store.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {store.description}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">
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
                      className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Shopper actions
              </p>
              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  disabled={!canBuyerAct}
                  onClick={() =>
                    storeChat.openChat({
                      storeId: store._id,
                      storeName: store.name,
                      storeSlug: store.slug,
                      themeColor: store.themeColor,
                    })
                  }
                  className={`inline-flex w-full justify-center rounded-xl border px-5 py-3 text-sm font-medium transition ${
                    !canBuyerAct
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  Ask a question
                </button>
                <button
                  type="button"
                  disabled={isPending || !canBuyerAct}
                  onClick={handleToggleFollow}
                  className={`inline-flex w-full justify-center rounded-xl border px-5 py-3 text-sm font-medium transition ${
                    store.isFollowed
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white"
                  } ${isPending || !canBuyerAct ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {store.isFollowed ? "Following store" : "Follow store"}
                </button>
              </div>
              {!canBuyerAct ? (
                <p className="mt-3 text-sm text-slate-500">
                  Sign in to follow stores and contact sellers.
                </p>
              ) : null}
              {followError ? (
                <p className="mt-3 text-sm text-rose-600">{followError}</p>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                Seller tools
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Launch your own storefront
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/72">
                Open the Vendorly dashboard to create a catalog, upload product
                images, and manage customer conversations.
              </p>
              <a
                href={dashboardUrl}
                className="mt-6 inline-flex rounded-xl border border-white bg-white px-5 py-3 text-sm font-medium text-slate-950"
              >
                Go to dashboard
              </a>
            </div>
          </aside>
        </section>
      </main>
      <StoreAiAssistant
        storeDescription={store.description}
        storeId={store._id}
        storeName={store.name}
        themeColor={store.themeColor}
      />
    </ThemeWrapper>
  );
}
