"use server";

import { fetchMutation } from "convex/nextjs";

import { api } from "@vendorly/convex";

import { requireDashboardUser } from "@/lib/current-user";
import { getConvexServerOptions } from "@/lib/convex";

export async function markSellerNotificationsReadAction() {
  const currentUser = await requireDashboardUser();

  await fetchMutation(
    api.notifications.markAllRead,
    {
      userId: currentUser.id,
    },
    getConvexServerOptions(),
  );

  return {
    success: true as const,
  };
}
