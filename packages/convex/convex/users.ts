import { queryGeneric } from "convex/server";
import { v } from "convex/values";

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
