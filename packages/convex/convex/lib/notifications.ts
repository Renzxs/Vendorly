import type {
  NotificationKind,
  NotificationRecipientRole,
} from "@vendorly/utils";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type CreateNotificationInput = {
  body: string;
  href: string;
  kind: NotificationKind;
  recipientRole: NotificationRecipientRole;
  title: string;
  userId: string;
};

type NotificationStateDoc = Doc<"notificationStates">;

export async function getNotificationState(
  ctx: MutationCtx | QueryCtx,
  userId: string,
): Promise<NotificationStateDoc | null> {
  return await ctx.db
    .query("notificationStates")
    .withIndex("by_user_id", (query) => query.eq("userId", userId))
    .unique();
}

export async function createNotification(
  ctx: MutationCtx,
  input: CreateNotificationInput,
): Promise<Id<"notifications">> {
  const notificationId = await ctx.db.insert("notifications", input);
  const existingState = await getNotificationState(ctx, input.userId);

  if (existingState) {
    await ctx.db.patch(existingState._id, {
      unreadCount: existingState.unreadCount + 1,
    });
  } else {
    await ctx.db.insert("notificationStates", {
      unreadCount: 1,
      userId: input.userId,
    });
  }

  return notificationId;
}

export function truncateNotificationText(value: string, maxLength = 120) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}
