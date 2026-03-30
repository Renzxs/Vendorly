import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { getStoreFollowSummary } from "./lib/social";
import { syncUserRecord } from "./lib/users";

export const getStores = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();

    return stores.sort((left, right) => left.name.localeCompare(right.name));
  },
});

export const getStoreBySlug = queryGeneric({
  args: {
    slug: v.string(),
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (query) => query.eq("slug", args.slug))
      .unique();

    if (!store) {
      return null;
    }

    return {
      ...store,
      ...(await getStoreFollowSummary(ctx, store._id, args.viewerId)),
    };
  },
});

export const getStoresByOwner = queryGeneric({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const stores = await ctx.db
      .query("stores")
      .withIndex("by_owner", (query) => query.eq("ownerId", args.ownerId))
      .collect();

    return stores.sort((left, right) => left.name.localeCompare(right.name));
  },
});

export const createStore = mutationGeneric({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    bio: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    logoImage: v.optional(v.string()),
    themeColor: v.string(),
    layoutType: v.union(v.literal("grid"), v.literal("list")),
    ownerId: v.string(),
    ownerEmail: v.string(),
    ownerName: v.optional(v.string()),
    ownerImage: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    xUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingStore = await ctx.db
      .query("stores")
      .withIndex("by_slug", (query) => query.eq("slug", args.slug))
      .unique();

    if (existingStore) {
      throw new Error("That store slug is already taken.");
    }

    const syncedUser = await syncUserRecord(ctx, {
      authUserId: args.ownerId,
      email: args.ownerEmail,
      image: args.ownerImage,
      name: args.ownerName,
    });

    const storeId = await ctx.db.insert("stores", {
      bannerImage: args.bannerImage,
      bio: args.bio,
      description: args.description,
      instagramUrl: args.instagramUrl,
      layoutType: args.layoutType,
      logoImage: args.logoImage,
      name: args.name,
      ownerId: args.ownerId,
      slug: args.slug,
      tiktokUrl: args.tiktokUrl,
      themeColor: args.themeColor,
      websiteUrl: args.websiteUrl,
      xUrl: args.xUrl,
    });

    if (syncedUser.wasCreated) {
      await ctx.scheduler.runAfter(0, internal.discord.notifyNewUser, {
        authUserId: args.ownerId,
        email: args.ownerEmail,
        name: args.ownerName,
      });
    }

    await ctx.scheduler.runAfter(0, internal.discord.notifyNewStore, {
      ownerEmail: args.ownerEmail,
      ownerId: args.ownerId,
      ownerName: args.ownerName,
      slug: args.slug,
      storeId,
      storeName: args.name,
    });

    return storeId;
  },
});

export const updateStore = mutationGeneric({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    bio: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    logoImage: v.optional(v.string()),
    themeColor: v.string(),
    layoutType: v.union(v.literal("grid"), v.literal("list")),
    ownerId: v.string(),
    ownerEmail: v.string(),
    ownerName: v.optional(v.string()),
    ownerImage: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    xUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);

    if (!store) {
      throw new Error("Store not found.");
    }

    if (store.ownerId !== args.ownerId) {
      throw new Error("You can only update your own store.");
    }

    const conflictingStore = await ctx.db
      .query("stores")
      .withIndex("by_slug", (query) => query.eq("slug", args.slug))
      .unique();

    if (conflictingStore && conflictingStore._id !== args.storeId) {
      throw new Error("That store slug is already in use.");
    }

    const syncedUser = await syncUserRecord(ctx, {
      authUserId: args.ownerId,
      email: args.ownerEmail,
      image: args.ownerImage,
      name: args.ownerName,
    });

    await ctx.db.patch(args.storeId, {
      bannerImage: args.bannerImage,
      bio: args.bio,
      description: args.description,
      instagramUrl: args.instagramUrl,
      layoutType: args.layoutType,
      logoImage: args.logoImage,
      name: args.name,
      slug: args.slug,
      tiktokUrl: args.tiktokUrl,
      themeColor: args.themeColor,
      websiteUrl: args.websiteUrl,
      xUrl: args.xUrl,
    });

    if (syncedUser.wasCreated) {
      await ctx.scheduler.runAfter(0, internal.discord.notifyNewUser, {
        authUserId: args.ownerId,
        email: args.ownerEmail,
        name: args.ownerName,
      });
    }

    return args.storeId;
  },
});

export const toggleStoreFollow = mutationGeneric({
  args: {
    storeId: v.id("stores"),
    viewerId: v.string(),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);

    if (!store) {
      throw new Error("Store not found.");
    }

    const existingFollow = await ctx.db
      .query("storeFollowers")
      .withIndex("by_store", (query) => query.eq("storeId", args.storeId))
      .collect();
    const viewerFollow = existingFollow.find(
      (follow) => follow.viewerId === args.viewerId,
    );

    if (viewerFollow) {
      await ctx.db.delete(viewerFollow._id);
      return {
        isFollowed: false,
      };
    }

    await ctx.db.insert("storeFollowers", {
      storeId: args.storeId,
      viewerId: args.viewerId,
    });

    return {
      isFollowed: true,
    };
  },
});
