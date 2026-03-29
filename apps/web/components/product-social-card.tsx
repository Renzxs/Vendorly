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
  const resolvedStoreName =
    storeName ?? ("store" in product ? product.store?.name : undefined) ?? "Vendorly store";
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
    <div className="space-y-3">
      <ProductCard
        footerContent={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => cart.addItem(product, resolvedStoreName)}
              className="inline-flex items-center border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add to cart
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
              className="inline-flex items-center border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400"
            >
              Chat store
            </button>
          </div>
        }
        layout={layout}
        product={product}
        storeName={resolvedStoreName}
        themeColor={resolvedThemeColor}
      />
      <div className="border border-black/10 bg-[rgba(255,253,247,0.9)] px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
              Product reactions
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {totalReactions} total reaction{totalReactions === 1 ? "" : "s"} so far.
            </p>
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
                  className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-black/10 bg-white text-slate-700 hover:border-slate-400"
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
        {error ? (
          <p className="mt-3 text-sm text-rose-600">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
