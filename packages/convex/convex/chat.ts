import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import {
  createNotification,
  truncateNotificationText,
} from "./lib/notifications";

function sortMessagesAscending(left: any, right: any) {
  return (left._creationTime ?? 0) - (right._creationTime ?? 0);
}

function buildDashboardChatHref(storeId: string, viewerId: string) {
  const searchParams = new URLSearchParams({
    chat: viewerId,
    store: storeId,
  });

  return `/dashboard?${searchParams.toString()}`;
}

function buildBuyerChatHref(args: {
  storeId: string;
  storeName: string;
  storeSlug: string;
}) {
  const searchParams = new URLSearchParams({
    storeId: args.storeId,
    storeName: args.storeName,
    storeSlug: args.storeSlug,
  });

  return `/chat?${searchParams.toString()}`;
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

export const sendViewerStoreMessage = mutationGeneric({
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

    const messageId = await ctx.db.insert("chatMessages", {
      body,
      productId: args.productId,
      productTitle: args.productTitle,
      senderType: "buyer",
      storeId: args.storeId,
      viewerId: args.viewerId,
      viewerName: args.viewerName?.trim() || undefined,
    });

    await createNotification(ctx, {
      body: `${
        args.viewerName?.trim() || `Guest ${args.viewerId.slice(0, 4)}`
      }: ${truncateNotificationText(body, 90)}`,
      href: buildDashboardChatHref(String(args.storeId), args.viewerId),
      kind: "chat_message",
      recipientRole: "seller",
      title: `New message for ${store.name}`,
      userId: store.ownerId,
    });

    return messageId;
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

    const messageId = await ctx.db.insert("chatMessages", {
      body,
      senderType: "seller",
      storeId: args.storeId,
      viewerId: args.viewerId,
    });

    await createNotification(ctx, {
      body: `${store.name}: ${truncateNotificationText(body, 90)}`,
      href: buildBuyerChatHref({
        storeId: String(args.storeId),
        storeName: store.name,
        storeSlug: store.slug,
      }),
      kind: "chat_message",
      recipientRole: "buyer",
      title: `${store.name} replied to your chat`,
      userId: args.viewerId,
    });

    return messageId;
  },
});
