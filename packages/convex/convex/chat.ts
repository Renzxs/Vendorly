import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

function sortMessagesAscending(left: any, right: any) {
  return (left._creationTime ?? 0) - (right._creationTime ?? 0);
}

export const getViewerStoreMessages = queryGeneric({
  args: {
    storeId: v.id("stores"),
    viewerId: v.string(),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);

    if (!store) {
      return [];
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_store_viewer", (query: any) =>
        query.eq("storeId", args.storeId).eq("viewerId", args.viewerId),
      )
      .collect()
      .then((messages) => messages.sort(sortMessagesAscending));
  },
});

export const getOwnerStoreChatThreads = queryGeneric({
  args: {
    ownerId: v.string(),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);

    if (!store || store.ownerId !== args.ownerId) {
      return [];
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_store", (query) => query.eq("storeId", args.storeId))
      .collect();

    const threadMap = new Map<string, any>();

    for (const message of messages) {
      const existingThread = threadMap.get(message.viewerId);

      if (
        !existingThread ||
        (message._creationTime ?? 0) > (existingThread.lastMessageAt ?? 0)
      ) {
        threadMap.set(message.viewerId, {
          lastMessageAt: message._creationTime,
          lastMessageBody: message.body,
          lastProductTitle: message.productTitle,
          lastSenderType: message.senderType,
          messageCount: (existingThread?.messageCount ?? 0) + 1,
          storeId: message.storeId,
          viewerId: message.viewerId,
          viewerName:
            message.viewerName ??
            existingThread?.viewerName ??
            `Guest ${message.viewerId.slice(0, 4)}`,
        });
      } else {
        existingThread.messageCount += 1;
      }
    }

    return Array.from(threadMap.values()).sort(
      (left, right) => (right.lastMessageAt ?? 0) - (left.lastMessageAt ?? 0),
    );
  },
});

export const getOwnerStoreChatMessages = queryGeneric({
  args: {
    ownerId: v.string(),
    storeId: v.id("stores"),
    viewerId: v.string(),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);

    if (!store || store.ownerId !== args.ownerId) {
      return [];
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_store_viewer", (query: any) =>
        query.eq("storeId", args.storeId).eq("viewerId", args.viewerId),
      )
      .collect()
      .then((messages) => messages.sort(sortMessagesAscending));
  },
});

export const sendViewerStoreMessage = internalMutation({
  args: {
    body: v.string(),
    productId: v.optional(v.id("products")),
    productTitle: v.optional(v.string()),
    storeId: v.id("stores"),
    viewerId: v.string(),
    viewerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);

    if (!store) {
      throw new Error("Store not found.");
    }

    const body = args.body.trim();

    if (!body) {
      throw new Error("Message cannot be empty.");
    }

    return await ctx.db.insert("chatMessages", {
      body,
      productId: args.productId,
      productTitle: args.productTitle,
      senderType: "buyer",
      storeId: args.storeId,
      viewerId: args.viewerId,
      viewerName: args.viewerName?.trim() || undefined,
    });
  },
});

export const sendSellerStoreMessage = mutationGeneric({
  args: {
    body: v.string(),
    ownerId: v.string(),
    storeId: v.id("stores"),
    viewerId: v.string(),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);

    if (!store || store.ownerId !== args.ownerId) {
      throw new Error("You can only reply to chats in your own store.");
    }

    const body = args.body.trim();

    if (!body) {
      throw new Error("Message cannot be empty.");
    }

    return await ctx.db.insert("chatMessages", {
      body,
      senderType: "seller",
      storeId: args.storeId,
      viewerId: args.viewerId,
    });
  },
});
