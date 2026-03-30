import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

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
