"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ProductCard } from "@vendorly/ui";
import {
  PRODUCT_REACTION_OPTIONS,
  getTotalReactionCount,
  type MarketplaceProduct,
  type Product,
  type ProductReaction,
} from "@vendorly/utils";

import { toggleProductReactionAction } from "@/app/actions/buyer";
import { useCart } from "@/lib/cart";
import { useStoreChat } from "@/lib/store-chat";

type ProductSocialCardProps = {
  layout?: "grid" | "list";
  product: Product | MarketplaceProduct;
  storeName?: string;
  storeSlug?: string;
  themeColor?: string;
  viewerId?: string | null;
};

export function ProductSocialCard({
  layout = "list",
  product,
  storeName,
  storeSlug,
  themeColor,
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

  function handleReaction(reaction: ProductReaction) {
    if (!canBuyerAct) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await toggleProductReactionAction({
          productId: product._id,
          reaction,
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
              onClick={() =>
                storeChat.openChat({
                  productId: product._id,
                  productTitle: product.title,
                  storeId: product.storeId,
                  storeName: resolvedStoreName,
                  storeSlug: resolvedStoreSlug,
                  themeColor: resolvedThemeColor,
                })
              }
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
