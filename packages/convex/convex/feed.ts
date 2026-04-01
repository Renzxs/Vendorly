import {
  mutationGeneric,
  paginationOptsValidator,
  queryGeneric,
} from "convex/server";
import { v } from "convex/values";

import { hydrateFeedPost } from "./lib/feed";
import { hydrateMarketplaceProduct } from "./lib/products";
import { getFollowedStoreIds } from "./lib/social";

export const getRecentFeedPosts = queryGeneric({
  args: {
    authorViewerId: v.optional(v.string()),
    limit: v.optional(v.number()),
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(Math.floor(args.limit ?? 4), 1), 8);
    const posts = args.authorViewerId
      ? await ctx.db
          .query("feedPosts")
          .withIndex("by_viewer", (query) =>
            query.eq("viewerId", args.authorViewerId!),
          )
          .order("desc")
          .take(limit)
      : await ctx.db.query("feedPosts").order("desc").take(limit);

    return await Promise.all(
      posts.map(
        async (post) => await hydrateFeedPost(ctx, post, args.viewerId),
      ),
    );
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

export const toggleFeedPostReaction = mutationGeneric({
  args: {
    postId: v.id("feedPosts"),
    reaction: v.union(v.literal("love"), v.literal("fire"), v.literal("wow")),
    viewerId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error("Post not found.");
    }

    const existingReaction = await ctx.db
      .query("feedPostReactions")
      .withIndex("by_post", (query) => query.eq("postId", args.postId))
      .collect()
      .then((reactions) =>
        reactions.find((reaction) => reaction.viewerId === args.viewerId),
      );

    if (existingReaction?.reaction === args.reaction) {
      await ctx.db.delete(existingReaction._id);
      return {
        viewerReaction: undefined,
      };
    }

    if (existingReaction) {
      await ctx.db.patch(existingReaction._id, {
        reaction: args.reaction,
      });

      return {
        viewerReaction: args.reaction,
      };
    }

    await ctx.db.insert("feedPostReactions", {
      postId: args.postId,
      reaction: args.reaction,
      viewerId: args.viewerId,
    });

    return {
      viewerReaction: args.reaction,
    };
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
