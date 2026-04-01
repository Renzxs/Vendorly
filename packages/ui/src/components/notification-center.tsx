"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn, type NotificationItem } from "@vendorly/utils";

const notificationTimeFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
});

function formatNotificationTime(value?: number) {
  if (!value) {
    return "Just now";
  }

  return notificationTimeFormatter.format(value);
}

type NotificationCenterProps = {
  emptyMessage?: string;
  isLoading?: boolean;
  notifications?: NotificationItem[];
  onMarkAllRead?: () => Promise<void> | void;
  title?: string;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  triggerContent?: ReactNode;
  unreadCount?: number;
};

export function NotificationCenter({
  emptyMessage = "New order and chat updates will show up here.",
  isLoading = false,
  notifications = [],
  onMarkAllRead,
  title = "Notifications",
  triggerAriaLabel,
  triggerClassName,
  triggerContent,
  unreadCount = 0,
}: NotificationCenterProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedRef = useRef(false);
  const previousLatestNotificationIdRef = useRef<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [toastNotification, setToastNotification] =
    useState<NotificationItem | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const latestNotification = notifications[0];

    if (!latestNotification) {
      hasInitializedRef.current = true;
      previousLatestNotificationIdRef.current = null;
      return;
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      previousLatestNotificationIdRef.current = latestNotification._id;
      return;
    }

    if (
      latestNotification._id !== previousLatestNotificationIdRef.current &&
      latestNotification.isUnread
    ) {
      setToastNotification(latestNotification);
    }

    previousLatestNotificationIdRef.current = latestNotification._id;
  }, [isLoading, notifications]);

  useEffect(() => {
    if (!toastNotification) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastNotification(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toastNotification]);

  async function handleMarkAllRead() {
    if (!onMarkAllRead || unreadCount === 0) {
      return;
    }

    setIsMarkingRead(true);

    try {
      await onMarkAllRead();
    } finally {
      setIsMarkingRead(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {toastNotification ? (
        <div className="fixed left-1/2 top-20 z-[60] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2">
          <div className="rounded-[1.4rem] border border-emerald-200 bg-white/95 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  New notification
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {toastNotification.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {toastNotification.body}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToastNotification(null)}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {formatNotificationTime(toastNotification._creationTime)}
              </p>
              <a
                href={toastNotification.href}
                onClick={() => setToastNotification(null)}
                className="inline-flex items-center rounded-xl border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Open
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={triggerAriaLabel}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white",
          triggerClassName,
        )}
      >
        {triggerContent ?? (
          <>
            <span>{title}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-semibold",
                unreadCount > 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500",
              )}
            >
              {unreadCount}
            </span>
          </>
        )}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Inbox
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                {title}
              </p>
            </div>
            <button
              type="button"
              disabled={isMarkingRead || unreadCount === 0}
              onClick={handleMarkAllRead}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              {isMarkingRead ? "Saving..." : "Mark all read"}
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="mb-3 h-24 animate-pulse rounded-[1.25rem] border border-slate-200 bg-slate-50"
                />
              ))
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <a
                  key={notification._id}
                  href={notification.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "mb-3 block rounded-[1.25rem] border px-4 py-3 transition last:mb-0",
                    notification.isUnread
                      ? "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">
                      {notification.title}
                    </p>
                    {notification.isUnread ? (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {notification.body}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {formatNotificationTime(notification._creationTime)}
                  </p>
                </a>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                <p className="font-semibold tracking-tight text-slate-950">
                  Inbox is clear
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {emptyMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
