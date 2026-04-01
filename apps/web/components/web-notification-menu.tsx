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
        d="M8.5 17.75H15.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <path
        d="M10 17.75C10.35 18.77 11.24 19.5 12.25 19.5C13.26 19.5 14.15 18.77 14.5 17.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <path
        d="M7.25 9.5C7.25 6.87665 9.37665 4.75 12 4.75C14.6234 4.75 16.75 6.87665 16.75 9.5V11.6129C16.75 12.2511 16.9382 12.8751 17.2911 13.4068L18.1938 14.7667C18.8447 15.7474 18.1417 17.068 16.9647 17.068H7.03527C5.85834 17.068 5.15531 15.7474 5.8062 14.7667L6.70888 13.4068C7.06176 12.8751 7.25 12.2511 7.25 11.6129V9.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M12 4.75V3.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
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
            <BellIcon className="h-6 w-6" />
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
