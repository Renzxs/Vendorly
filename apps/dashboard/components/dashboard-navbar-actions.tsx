"use client";

import { useQuery } from "convex/react";

import { api } from "@vendorly/convex";
import { NotificationCenter } from "@vendorly/ui";
import type { NotificationInbox } from "@vendorly/utils";

import { markSellerNotificationsReadAction } from "@/app/actions/notifications";

export function DashboardNavbarActions({ userId }: { userId: string }) {
  const inbox = useQuery(api.notifications.getInbox, {
    limit: 10,
    recipientRole: "seller",
    userId,
  }) as NotificationInbox | undefined;

  return (
    <NotificationCenter
      emptyMessage="New customer messages and order activity will appear here."
      isLoading={!inbox}
      notifications={inbox?.notifications}
      onMarkAllRead={async () => {
        await markSellerNotificationsReadAction();
      }}
      unreadCount={inbox?.unreadCount ?? 0}
    />
  );
}
