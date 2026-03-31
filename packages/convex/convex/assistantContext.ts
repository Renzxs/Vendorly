import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internalQuery } from "./_generated/server";

const MAX_STORE_CONTEXT_PRODUCTS = 12;
const MAX_RELATED_PRODUCTS = 6;

function serializeProductForAssistant(product: Doc<"products">) {
  return {
    _id: product._id,
    description: product.description,
    isSoldOut: Boolean(product.isSoldOut),
    price: product.price,
    title: product.title,
  };
}

export const getStoreAssistantContext = internalQuery({
  args: {
    productId: v.optional(v.id("products")),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);

    if (!store) {
      return null;
    }

    const highlightedProduct = args.productId
      ? await ctx.db.get(args.productId)
      : null;

    if (args.productId && !highlightedProduct) {
      throw new Error("Product not found.");
    }

    if (highlightedProduct && highlightedProduct.storeId !== args.storeId) {
      throw new Error("That product does not belong to this store.");
    }

    const catalogPreview = await ctx.db
      .query("products")
      .withIndex("by_store", (query) => query.eq("storeId", args.storeId))
      .order("desc")
      .take(MAX_STORE_CONTEXT_PRODUCTS);

    const relatedProducts = args.productId
      ? catalogPreview
          .filter((product) => product._id !== args.productId)
          .slice(0, MAX_RELATED_PRODUCTS)
      : catalogPreview;

    return {
      catalogPreview: relatedProducts.map(serializeProductForAssistant),
      catalogPreviewLimit: MAX_STORE_CONTEXT_PRODUCTS,
      highlightedProduct: highlightedProduct
        ? serializeProductForAssistant(highlightedProduct)
        : null,
      store: {
        bio: store.bio,
        description: store.description,
        instagramUrl: store.instagramUrl,
        layoutType: store.layoutType,
        name: store.name,
        slug: store.slug,
        themeColor: store.themeColor,
        tiktokUrl: store.tiktokUrl,
        websiteUrl: store.websiteUrl,
        xUrl: store.xUrl,
      },
    };
  },
});
