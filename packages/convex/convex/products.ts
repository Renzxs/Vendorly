import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import { getFollowedStoreIds, getProductReactionSummary } from "./lib/social";

async function hydrateProduct(ctx: any, product: any) {
  const externalImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
  const uploadedImages = await Promise.all(
    (product.imageStorageIds ?? []).map(async (storageId: any) =>
      await ctx.storage.getUrl(storageId),
    ),
  );
  const resolvedImages = [...externalImages, ...uploadedImages.filter(Boolean)];

  return {
    ...product,
    image: resolvedImages[0] ?? product.image,
    resolvedImages,
  };
}

export const getProductsByStore = queryGeneric({
  args: {
    storeId: v.id("stores"),
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_store", (query) => query.eq("storeId", args.storeId))
      .collect();

    const sortedProducts = products.sort(
      (left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0),
    );

    return await Promise.all(
      sortedProducts.map(async (product) => ({
        ...(await hydrateProduct(ctx, product)),
        ...(await getProductReactionSummary(ctx, product._id, args.viewerId)),
      })),
    );
  },
});

export const getMarketplaceProducts = queryGeneric({
  args: {
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();

    const hydratedProducts = await Promise.all(
      products.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        const hydratedProduct = await hydrateProduct(ctx, product);
        const reactionSummary = await getProductReactionSummary(
          ctx,
          product._id,
          args.viewerId,
        );

        return {
          ...hydratedProduct,
          ...reactionSummary,
          store: store
            ? {
                _id: store._id,
                name: store.name,
                slug: store.slug,
                themeColor: store.themeColor,
              }
            : undefined,
        };
      }),
    );

    return hydratedProducts.sort(
      (left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0),
    );
  },
});

export const getProductFeed = queryGeneric({
  args: {
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();
    const followedStoreIds = await getFollowedStoreIds(ctx, args.viewerId);

    const feedProducts = await Promise.all(
      products.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        const hydratedProduct = await hydrateProduct(ctx, product);
        const reactionSummary = await getProductReactionSummary(
          ctx,
          product._id,
          args.viewerId,
        );
        const fromFollowedStore = followedStoreIds.has(String(product.storeId));

        return {
          ...hydratedProduct,
          ...reactionSummary,
          fromFollowedStore,
          store: store
            ? {
                _id: store._id,
                name: store.name,
                slug: store.slug,
                themeColor: store.themeColor,
              }
            : undefined,
        };
      }),
    );

    return feedProducts.sort((left, right) => {
      if (left.fromFollowedStore !== right.fromFollowedStore) {
        return left.fromFollowedStore ? -1 : 1;
      }

      if ((right.reactionCount ?? 0) !== (left.reactionCount ?? 0)) {
        return (right.reactionCount ?? 0) - (left.reactionCount ?? 0);
      }

      return (right._creationTime ?? 0) - (left._creationTime ?? 0);
    });
  },
});

export const generateProductImageUploadUrl = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createProduct = mutationGeneric({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    storeId: v.id("stores"),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);

    if (!store) {
      throw new Error("Store not found.");
    }

    if (store.ownerId !== args.ownerId) {
      throw new Error("You can only create products for your own store.");
    }

    return await ctx.db.insert("products", {
      description: args.description,
      image: args.image,
      images: args.images,
      imageStorageIds: args.imageStorageIds,
      price: args.price,
      storeId: args.storeId,
      title: args.title,
    });
  },
});

export const updateProduct = mutationGeneric({
  args: {
    productId: v.id("products"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    const store = await ctx.db.get(product.storeId);

    if (!store || store.ownerId !== args.ownerId) {
      throw new Error("You can only update products in your own store.");
    }

    await ctx.db.patch(args.productId, {
      description: args.description,
      image: args.image,
      images: args.images,
      imageStorageIds: args.imageStorageIds,
      price: args.price,
      title: args.title,
    });

    return args.productId;
  },
});

export const toggleProductReaction = mutationGeneric({
  args: {
    productId: v.id("products"),
    reaction: v.union(v.literal("love"), v.literal("fire"), v.literal("wow")),
    viewerId: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    const existingReaction = await ctx.db
      .query("productReactions")
      .withIndex("by_product", (query) => query.eq("productId", args.productId))
      .collect();
    const viewerReaction = existingReaction.find(
      (reaction) => reaction.viewerId === args.viewerId,
    );

    if (viewerReaction?.reaction === args.reaction) {
      await ctx.db.delete(viewerReaction._id);
      return {
        viewerReaction: undefined,
      };
    }

    if (viewerReaction) {
      await ctx.db.patch(viewerReaction._id, {
        reaction: args.reaction,
      });

      return {
        viewerReaction: args.reaction,
      };
    }

    await ctx.db.insert("productReactions", {
      productId: args.productId,
      reaction: args.reaction,
      viewerId: args.viewerId,
    });

    return {
      viewerReaction: args.reaction,
    };
  },
});
