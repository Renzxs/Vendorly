"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@vendorly/convex";
import { ThemeWrapper } from "@vendorly/ui";
import {
  PRODUCT_REACTION_OPTIONS,
  formatCurrency,
  getProductImages,
  getTotalReactionCount,
  type MarketplaceProduct,
  type ProductReaction,
} from "@vendorly/utils";

import { useCart } from "@/lib/cart";
import { useStoreChat } from "@/lib/store-chat";
import { useViewerId } from "@/lib/use-viewer-id";

function ProductPageLoading() {
  return (
    <main className="mx-auto max-w-[80rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <div className="space-y-6">
          <div className="aspect-[5/4] animate-pulse rounded-[2rem] border border-slate-200 bg-white" />
          <div className="h-56 animate-pulse rounded-[2rem] border border-slate-200 bg-white" />
        </div>
        <div className="space-y-6">
          <div className="h-96 animate-pulse rounded-[2rem] border border-slate-200 bg-white" />
          <div className="h-52 animate-pulse rounded-[2rem] border border-slate-200 bg-white" />
        </div>
      </div>
    </main>
  );
}

function ProductNotFoundState() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Product not found
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-slate-950 sm:text-5xl">
          This product page is no longer available.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The item may have been removed, or the link may be out of date.
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

export function ProductPageShell({ productId }: { productId: string }) {
  const viewerId = useViewerId();
  const cart = useCart();
  const storeChat = useStoreChat();
  const toggleReaction = useMutation(api.products.toggleProductReaction);
  const product = useQuery(api.products.getProductById, {
    productId,
    viewerId: viewerId ?? undefined,
  }) as MarketplaceProduct | null | undefined;
  const [activeImage, setActiveImage] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const images = useMemo(
    () => (product ? getProductImages(product) : []),
    [product],
  );

  useEffect(() => {
    setActiveImage(0);
  }, [product?._id]);

  if (product === undefined) {
    return <ProductPageLoading />;
  }

  if (product === null) {
    return <ProductNotFoundState />;
  }

  const currentImage = images[activeImage] ?? images[0];
  const productRecordId = product._id;
  const productStoreId = product.storeId;
  const productTitle = product.title;
  const storeName = product.store?.name ?? "Vendorly store";
  const storeSlug = product.store?.slug;
  const themeColor = product.store?.themeColor;
  const totalReactions =
    product.reactionCount ?? getTotalReactionCount(product.reactionCounts);
  const isSoldOut = Boolean(product.isSoldOut);

  function handleReaction(reaction: ProductReaction) {
    if (!viewerId) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await toggleReaction({
          productId: productRecordId,
          reaction,
          viewerId,
        });
      } catch (mutationError) {
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : "Unable to save reaction.",
        );
      }
    });
  }

  return (
    <ThemeWrapper themeColor={themeColor}>
      <main className="mx-auto max-w-[80rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            >
              Back to marketplace
            </Link>
            {storeSlug ? (
              <Link
                href={`/store/${storeSlug}`}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
              >
                Visit {storeName}
              </Link>
            ) : null}
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            {totalReactions} reaction{totalReactions === 1 ? "" : "s"}
          </span>
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[5/4] overflow-hidden border-b border-slate-200 bg-slate-100">
                {isSoldOut ? (
                  <span className="absolute left-5 top-5 z-10 rounded-full border border-rose-200 bg-white/95 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-rose-600 backdrop-blur">
                    Sold out
                  </span>
                ) : null}
                {currentImage ? (
                  <img
                    alt={product.title}
                    className="h-full w-full object-cover"
                    src={currentImage}
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--vendorly-theme), rgba(241,245,249,0.96), rgba(226,232,240,0.92))",
                    }}
                  />
                )}
              </div>

              {images.length > 1 ? (
                <div className="flex flex-wrap gap-3 p-4 sm:p-5">
                  {images.map((image, index) => (
                    <button
                      key={`${product._id}-${image}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-16 w-16 overflow-hidden rounded-2xl border-2 bg-slate-50 transition ${
                        index === activeImage
                          ? "border-slate-950 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      aria-label={`View image ${index + 1} for ${product.title}`}
                    >
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        src={image}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Product details
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  What shoppers need to know
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                  {product.description}
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Storefront
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  {storeName}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This single product page keeps the key shopper actions in one
                  place, even outside the feed.
                </p>
                <div className="mt-5 grid gap-3">
                  {storeSlug ? (
                    <Link
                      href={`/store/${storeSlug}`}
                    className="inline-flex w-full justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                  >
                    View storefront
                  </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      storeChat.openChat({
                        productId: productRecordId,
                        productTitle,
                        storeId: productStoreId,
                        storeName,
                        storeSlug,
                        themeColor,
                      })
                    }
                    className="inline-flex w-full justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                  >
                    Ask the seller
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                {storeName}
              </p>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-slate-950">
                {product.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <p className="text-4xl font-semibold tracking-tight text-slate-950">
                  {formatCurrency(product.price)}
                </p>
                <span
                  className={`rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] ${
                    isSoldOut
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {isSoldOut ? "Sold out" : "Available now"}
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">
                Jump from discovery to purchase or seller chat without having to
                go back to the feed.
              </p>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => cart.addItem(product, storeName)}
                  className={`inline-flex w-full items-center justify-center rounded-xl border px-5 py-3 text-sm font-medium transition ${
                    isSoldOut
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  {isSoldOut ? "Sold out" : "Add to cart"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    storeChat.openChat({
                      productId: productRecordId,
                      productTitle,
                      storeId: productStoreId,
                      storeName,
                      storeSlug,
                      themeColor,
                    })
                  }
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                >
                  Chat seller
                </button>
                {storeSlug ? (
                  <Link
                    href={`/store/${storeSlug}`}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                  >
                    View storefront
                  </Link>
                ) : null}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                {isSoldOut
                  ? "This item is currently unavailable, but you can still message the seller for restock updates or alternatives."
                  : "Signed-in shoppers can add this item to cart immediately, or message the seller first if they need more details."}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Product reactions
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {totalReactions} total reaction
                {totalReactions === 1 ? "" : "s"} from shoppers so far.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {PRODUCT_REACTION_OPTIONS.map((option) => {
                  const active = product.viewerReaction === option.value;
                  const count = product.reactionCounts?.[option.value] ?? 0;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isPending || !viewerId}
                      onClick={() => handleReaction(option.value)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                      } ${isPending || !viewerId ? "cursor-not-allowed opacity-60" : ""}`}
                      aria-label={`${option.label} reaction`}
                    >
                      <span aria-hidden="true" className="text-lg leading-none">
                        {option.emoji}
                      </span>
                      <span className="sr-only">{option.label}</span>
                      <span
                        className={active ? "text-white/75" : "text-slate-400"}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!viewerId ? (
                <p className="mt-4 text-sm text-slate-500">
                  Sign in to react, add items to cart, and start a seller
                  conversation.
                </p>
              ) : null}
              {error ? (
                <p className="mt-4 text-sm text-rose-600">{error}</p>
              ) : null}
            </div>
          </aside>
        </section>
      </main>
    </ThemeWrapper>
  );
}
