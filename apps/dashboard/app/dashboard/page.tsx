import { fetchQuery } from "convex/nextjs";

import { api } from "@vendorly/convex";
import type { Product, Store } from "@vendorly/utils";

import { DashboardShell } from "@/components/dashboard-shell";
import { requireDashboardUser } from "@/lib/current-user";
import { getConvexServerOptions } from "@/lib/convex";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const currentUser = await requireDashboardUser();
  const convexOptions = getConvexServerOptions();
  const stores = (await fetchQuery(
    api.stores.getStoresByOwner,
    {
      ownerId: currentUser.id,
    },
    convexOptions,
  )) as Store[];
  const resolvedSearchParams = await searchParams;
  const requestedStoreId =
    typeof resolvedSearchParams.store === "string"
      ? resolvedSearchParams.store
      : undefined;

  const selectedStore =
    stores.find((store) => store._id === requestedStoreId) ?? stores[0];
  const selectedStoreProducts = selectedStore
    ? await fetchQuery(
        api.products.getProductsByStore,
        {
          storeId: selectedStore._id,
        },
        convexOptions,
      )
    : [];

  return (
    <DashboardShell
      currentUser={currentUser}
      selectedStoreId={selectedStore?._id}
      selectedStoreProducts={selectedStoreProducts as Product[]}
      stores={stores}
    />
  );
}
