"use client";

import { useQuery } from "convex/react";

import { api } from "@vendorly/convex";
import { NotificationCenter } from "@vendorly/ui";
import type { NotificationInbox } from "@vendorly/utils";

import { markBuyerNotificationsReadAction } from "@/app/actions/buyer";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 18H15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M10.5 21H13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.75 9.25C6.75 6.35051 9.10051 4 12 4C14.8995 4 17.25 6.35051 17.25 9.25V12.0463C17.25 12.6305 17.4204 13.2019 17.7405 13.6906L18.7447 15.2244C19.2388 15.9792 18.698 17 17.7958 17H6.2042C5.30203 17 4.7612 15.9792 5.25527 15.2244L6.25947 13.6906C6.57958 13.2019 6.75 12.6305 6.75 12.0463V9.25Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function WebNotificationMenu({
  iconOnly = false,
  userId,
}: {
  iconOnly?: boolean;
  userId: string;
}) {
  const inbox = useQuery(api.notifications.getInbox, {
    limit: 10,
    recipientRole: "buyer",
    userId,
  }) as NotificationInbox | undefined;
  const unreadCount = inbox?.unreadCount ?? 0;

  return (
    <NotificationCenter
      emptyMessage="Order updates and seller replies will appear here."
      isLoading={!inbox}
      notifications={inbox?.notifications}
      onMarkAllRead={async () => {
        await markBuyerNotificationsReadAction();
      }}
      triggerAriaLabel={
        iconOnly
          ? `Open notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`
          : undefined
      }
      triggerClassName={
        iconOnly
          ? "relative h-11 w-11 justify-center rounded-full px-0"
          : undefined
      }
      triggerContent={
        iconOnly ? (
          <>
            <span className="sr-only">Notifications</span>
            <BellIcon className="h-5 w-5" />
            <span
              className={`absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border px-1.5 text-[0.65rem] font-semibold leading-5 ${
                unreadCount > 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {unreadCount}
            </span>
          </>
        ) : undefined
      }
      unreadCount={unreadCount}
    />
  );
}
