"use client";

import { useQuery } from "convex/react";

import { api } from "@vendorly/convex";
import { NotificationCenter } from "@vendorly/ui";
import type { NotificationInbox } from "@vendorly/utils";

import { markBuyerNotificationsReadAction } from "@/app/actions/buyer";

export function WebNotificationMenu({ userId }: { userId: string }) {
  const inbox = useQuery(api.notifications.getInbox, {
    limit: 10,
    userId,
  }) as NotificationInbox | undefined;

  return (
    <NotificationCenter
      emptyMessage="Order updates and seller replies will appear here."
      isLoading={!inbox}
      notifications={inbox?.notifications}
      onMarkAllRead={async () => {
        await markBuyerNotificationsReadAction();
      }}
      unreadCount={inbox?.unreadCount ?? 0}
    />
  );
}
