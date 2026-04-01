import {
  mutationGeneric,
  paginationOptsValidator,
  queryGeneric,
} from "convex/server";
import { v } from "convex/values";

import { hydrateMarketplaceProduct } from "./lib/products";
import { getFollowedStoreIds } from "./lib/social";

export const getRecentFeedPosts = queryGeneric({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(Math.floor(args.limit ?? 4), 1), 8);

    return await ctx.db.query("feedPosts").order("desc").take(limit);
  },
});

export const createFeedPost = mutationGeneric({
  args: {
    body: v.string(),
    viewerId: v.string(),
    viewerImage: v.optional(v.string()),
    viewerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const body = args.body.trim();

    if (!body) {
      throw new Error("Write something before posting.");
    }

    if (body.length > 280) {
      throw new Error("Posts must stay under 280 characters.");
    }

    return await ctx.db.insert("feedPosts", {
      body,
      viewerId: args.viewerId,
      viewerImage: args.viewerImage?.trim() || undefined,
      viewerName: args.viewerName?.trim() || undefined,
    });
  },
});

export const getPaginatedProductFeed = queryGeneric({
  args: {
    paginationOpts: paginationOptsValidator,
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const followedStoreIds = await getFollowedStoreIds(ctx, args.viewerId);
    const productPage = await ctx.db
      .query("products")
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      productPage.page.map(async (product) => {
        const hydratedProduct = await hydrateMarketplaceProduct(
          ctx,
          product,
          args.viewerId,
        );

        return {
          ...hydratedProduct,
          fromFollowedStore: followedStoreIds.has(String(product.storeId)),
        };
      }),
    );

    page.sort((left, right) => {
      if (left.fromFollowedStore !== right.fromFollowedStore) {
        return left.fromFollowedStore ? -1 : 1;
      }

      return (right._creationTime ?? 0) - (left._creationTime ?? 0);
    });

    return {
      ...productPage,
      page,
    };
  },
});
