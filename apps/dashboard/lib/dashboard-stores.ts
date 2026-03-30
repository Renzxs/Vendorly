import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";

import { api } from "@vendorly/convex";
import type { Store } from "@vendorly/utils";

import { getConvexServerOptions } from "@/lib/convex";
import { requireDashboardUser } from "@/lib/current-user";

export async function getDashboardStoreContext() {
  const currentUser = await requireDashboardUser();
  const convexOptions = getConvexServerOptions();
  const stores = (await fetchQuery(
    api.stores.getStoresByOwner,
    {
      ownerId: currentUser.id,
    },
    convexOptions,
  )) as Store[];

  return {
    currentUser,
    convexOptions,
    stores,
  };
}

export async function getOwnedDashboardStore(storeId: string) {
  const context = await getDashboardStoreContext();
  const store = context.stores.find((entry) => entry._id === storeId);

  if (!store) {
    notFound();
  }

  return {
    ...context,
    store,
  };
}
