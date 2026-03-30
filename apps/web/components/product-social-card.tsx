"use client";

import { useState, useTransition } from "react";
import { useMutation } from "convex/react";

import { api } from "@vendorly/convex";
import { ProductCard } from "@vendorly/ui";
import {
  PRODUCT_REACTION_OPTIONS,
  getTotalReactionCount,
  type MarketplaceProduct,
  type Product,
  type ProductReaction,
} from "@vendorly/utils";

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
  const toggleReaction = useMutation(api.products.toggleProductReaction);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const totalReactions =
    product.reactionCount ?? getTotalReactionCount(product.reactionCounts);
  const isSoldOut = Boolean(product.isSoldOut);
  const resolvedStoreName =
    storeName ??
    ("store" in product ? product.store?.name : undefined) ??
    "Vendorly store";
  const resolvedThemeColor =
    themeColor ?? ("store" in product ? product.store?.themeColor : undefined);

  function handleReaction(reaction: ProductReaction) {
    if (!viewerId) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await toggleReaction({
          productId: product._id,
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
    <div className="flex h-full flex-col gap-3">
      <ProductCard
        footerContent={
          <>
            <button
              type="button"
              disabled={isSoldOut}
              onClick={() => cart.addItem(product, resolvedStoreName)}
              className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm font-medium transition ${
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
                  productId: product._id,
                  productTitle: product.title,
                  storeId: product.storeId,
                  storeName: resolvedStoreName,
                  storeSlug:
                    storeSlug ??
                    ("store" in product ? product.store?.slug : undefined),
                  themeColor: resolvedThemeColor,
                })
              }
              className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
            >
              Chat store
            </button>
          </>
        }
        layout={layout}
        product={product}
        storeName={resolvedStoreName}
        themeColor={resolvedThemeColor}
      />
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Product reactions
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {totalReactions} total reaction{totalReactions === 1 ? "" : "s"}{" "}
              so far.
            </p>
            {isSoldOut ? (
              <p className="mt-2 text-sm font-medium text-rose-600">
                This product is currently sold out. Buyers can still chat with
                the store for restock updates.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
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
                  <span className={active ? "text-white/75" : "text-slate-400"}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
}
