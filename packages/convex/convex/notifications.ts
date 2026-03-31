import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import { getNotificationState } from "./lib/notifications";

export const getInbox = queryGeneric({
  args: {
    limit: v.optional(v.number()),
    recipientRole: v.union(v.literal("buyer"), v.literal("seller")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 10, 20));
    const notificationState = await getNotificationState(ctx, {
      recipientRole: args.recipientRole,
      userId: args.userId,
    });
    const lastReadAt = notificationState?.lastReadAt ?? 0;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id_and_recipient_role", (query: any) =>
        query.eq("userId", args.userId).eq("recipientRole", args.recipientRole),
      )
      .order("desc")
      .take(limit);

    return {
      notifications: notifications.map((notification) => ({
        ...notification,
        isUnread: (notification._creationTime ?? 0) > lastReadAt,
      })),
      unreadCount: notificationState?.unreadCount ?? 0,
    };
  },
});

export const markAllRead = mutationGeneric({
  args: {
    recipientRole: v.union(v.literal("buyer"), v.literal("seller")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationState = await getNotificationState(ctx, {
      recipientRole: args.recipientRole,
      userId: args.userId,
    });

    if (!notificationState) {
      return {
        success: true,
        unreadCount: 0,
      };
    }

    if (notificationState.unreadCount === 0) {
      return {
        success: true,
        unreadCount: 0,
      };
    }

    await ctx.db.patch(notificationState._id, {
      lastReadAt: Date.now(),
      unreadCount: 0,
    });

    return {
      success: true,
      unreadCount: 0,
    };
  },
});
