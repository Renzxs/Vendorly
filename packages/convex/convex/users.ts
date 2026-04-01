import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import { hydrateFeedPost } from "./lib/feed";
import { hydrateMarketplaceProduct } from "./lib/products";
import { syncUserRecordAndNotify } from "./lib/users";

export const getUserByAuthUserId = queryGeneric({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (query) =>
        query.eq("authUserId", args.authUserId),
      )
      .unique();
  },
});

export const syncUser = mutationGeneric({
  args: {
    authUserId: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const syncedUser = await syncUserRecordAndNotify(ctx, args);

    return syncedUser.userId;
  },
});

export const getUserByEmail = queryGeneric({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (query) => query.eq("email", args.email))
      .unique();
  },
});

export const getPublicProfile = queryGeneric({
  args: {
    userId: v.string(),
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (query) => query.eq("authUserId", args.userId))
      .unique();

    if (!user) {
      return null;
    }

    const ownedStores = await ctx.db
      .query("stores")
      .withIndex("by_owner", (query) => query.eq("ownerId", args.userId))
      .take(6);
    const sortedStores = [...ownedStores].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
    const recentPosts = await ctx.db
      .query("feedPosts")
      .withIndex("by_viewer", (query) => query.eq("viewerId", args.userId))
      .order("desc")
      .take(6);
    const ownedProducts = (
      await Promise.all(
        sortedStores.map(async (store) =>
          await ctx.db
            .query("products")
            .withIndex("by_store", (query) => query.eq("storeId", store._id))
            .order("desc")
            .take(4),
        ),
      )
    )
      .flat()
      .sort((left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0))
      .slice(0, 8);

    return {
      posts: await Promise.all(
        recentPosts.map(
          async (post) => await hydrateFeedPost(ctx, post, args.viewerId),
        ),
      ),
      products: await Promise.all(
        ownedProducts.map(
          async (product) =>
            await hydrateMarketplaceProduct(ctx, product, args.viewerId),
        ),
      ),
      stores: sortedStores,
      user,
    };
  },
});
