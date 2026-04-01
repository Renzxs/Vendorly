"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState, useTransition } from "react";
import { ProductCard } from "@vendorly/ui";
import {
  PRODUCT_REACTION_OPTIONS,
  cn,
  formatCurrency,
  formatRelativeTime,
  getInitials,
  getProductImages,
  getTotalReactionCount,
  type MarketplaceProduct,
  type Product,
  type ProductReaction,
} from "@vendorly/utils";

import { toggleProductReactionAction } from "@/app/actions/buyer";
import { getActionErrorMessage } from "@/lib/action-errors";
import { useCart } from "@/lib/cart";
import { useStoreChat } from "@/lib/store-chat";

type ProductSocialCardProps = {
  layout?: "grid" | "list";
  product: Product | MarketplaceProduct;
  storeName?: string;
  storeSlug?: string;
  themeColor?: string;
  variant?: "default" | "feed";
  viewerId?: string | null;
};

export function ProductSocialCard({
  layout = "list",
  product,
  storeName,
  storeSlug,
  themeColor,
  variant = "default",
  viewerId,
}: ProductSocialCardProps) {
  const cart = useCart();
  const storeChat = useStoreChat();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const totalReactions =
    product.reactionCount ?? getTotalReactionCount(product.reactionCounts);
  const isSoldOut = Boolean(product.isSoldOut);
  const resolvedStoreName =
    storeName ??
    ("store" in product ? product.store?.name : undefined) ??
    "Vendorly store";
  const resolvedStoreSlug =
    storeSlug ?? ("store" in product ? product.store?.slug : undefined);
  const resolvedThemeColor =
    themeColor ?? ("store" in product ? product.store?.themeColor : undefined);
  const canBuyerAct = Boolean(viewerId);
  const productImage = getProductImages(product)[0];

  function handleReaction(reaction: ProductReaction) {
    if (!canBuyerAct) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const result = await toggleProductReactionAction({
          productId: product._id,
          reaction,
        });

        if (!result.success) {
          setError(result.message);
        }
      } catch (mutationError) {
        setError(getActionErrorMessage(mutationError, "Unable to save reaction."));
      }
    });
  }

  function openSellerChat() {
    if (!canBuyerAct) {
      return;
    }

    storeChat.openChat({
      productId: product._id,
      productTitle: product.title,
      storeId: product.storeId,
      storeName: resolvedStoreName,
      storeSlug: resolvedStoreSlug,
      themeColor: resolvedThemeColor,
    });
  }

  if (variant === "feed") {
    return (
      <article className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700">
              {getInitials(resolvedStoreName || "V")}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {resolvedStoreName}
                </p>
                {"fromFollowedStore" in product && product.fromFollowedStore ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Following
                  </span>
                ) : null}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium uppercase tracking-[0.2em] text-slate-400">
                  Product drop
                </span>
                {formatRelativeTime(product._creationTime) ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{formatRelativeTime(product._creationTime)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-base font-semibold tracking-tight text-slate-950">
              {formatCurrency(product.price)}
            </p>
            {isSoldOut ? (
              <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-rose-500">
                Sold out
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="sm:w-28 sm:shrink-0">
            <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-slate-100">
              {productImage ? (
                <img
                  alt={product.title}
                  className="aspect-square h-full w-full object-cover"
                  src={productImage}
                />
              ) : (
                <div
                  className="aspect-square w-full"
                  style={{
                    background: `linear-gradient(135deg, ${resolvedThemeColor ?? "#0f766e"}, #e2e8f0)`,
                  }}
                />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${product._id}`}
              className="inline-block text-xl font-semibold leading-tight tracking-tight text-slate-950 transition hover:text-slate-700"
            >
              {product.title}
            </Link>
            <p className="mt-2 text-sm leading-6 text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
              {product.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!canBuyerAct || isSoldOut}
                onClick={() => cart.addItem(product, resolvedStoreName)}
                className={cn(
                  "inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold transition",
                  !canBuyerAct || isSoldOut
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-950 bg-slate-950 text-white hover:bg-slate-800",
                )}
              >
                {isSoldOut ? "Sold out" : "Add to cart"}
              </button>
              <button
                type="button"
                disabled={!canBuyerAct}
                onClick={openSellerChat}
                className={cn(
                  "inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold transition",
                  !canBuyerAct
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white",
                )}
              >
                Chat seller
              </button>
              <Link
                href={`/product/${product._id}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-white"
              >
                View details
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {totalReactions}
              </span>{" "}
              reaction{totalReactions === 1 ? "" : "s"} on this drop
              {!canBuyerAct ? " • sign in to join in" : ""}
            </div>

            <div className="flex flex-wrap gap-2">
              {PRODUCT_REACTION_OPTIONS.map((option) => {
                const active = product.viewerReaction === option.value;
                const count = product.reactionCounts?.[option.value] ?? 0;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isPending || !canBuyerAct}
                    onClick={() => handleReaction(option.value)}
                    className={cn(
                      "inline-flex min-w-[4.25rem] items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                      (isPending || !canBuyerAct) && "cursor-not-allowed opacity-60",
                    )}
                    aria-label={`${option.label} reaction`}
                  >
                    <span aria-hidden="true" className="text-sm leading-none">
                      {option.emoji}
                    </span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>
      </article>
    );
  }

  return (
    <ProductCard
      className="h-full"
      footerLabel="Shop and react"
      footerContent={
        <div className="grid w-full gap-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!canBuyerAct || isSoldOut}
              onClick={() => cart.addItem(product, resolvedStoreName)}
              className={`col-span-2 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition ${
                !canBuyerAct || isSoldOut
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : "border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
              }`}
            >
              {isSoldOut ? "Sold out" : "Add to cart"}
            </button>
            <button
              type="button"
              disabled={!canBuyerAct}
              onClick={openSellerChat}
              className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition ${
                !canBuyerAct
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white"
              }`}
            >
              Chat seller
            </button>
            <Link
              href={`/product/${product._id}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
            >
              View details
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Product reactions
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {totalReactions} total reaction
                    {totalReactions === 1 ? "" : "s"} so far.
                  </p>
                  {!canBuyerAct ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Sign in to react, add items to cart, and chat with sellers.
                    </p>
                  ) : null}
                  {isSoldOut ? (
                    <p className="mt-1 text-sm font-medium text-rose-600">
                      Sold out, but you can still ask the seller about restocks.
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {PRODUCT_REACTION_OPTIONS.map((option) => {
                    const active = product.viewerReaction === option.value;
                    const count = product.reactionCounts?.[option.value] ?? 0;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isPending || !canBuyerAct}
                        onClick={() => handleReaction(option.value)}
                        className={`inline-flex min-w-[3.75rem] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                          active
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-white"
                        } ${isPending || !canBuyerAct ? "cursor-not-allowed opacity-60" : ""}`}
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
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            </div>
          </div>
        </div>
      }
      layout={layout}
      product={product}
      storeName={resolvedStoreName}
      themeColor={resolvedThemeColor}
    />
  );
}
