import { fetchQuery } from "convex/nextjs";

import { api } from "@vendorly/convex";
import type {
  ChatMessage,
  ChatThread,
  Order,
  Product,
  Store,
} from "@vendorly/utils";

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
  const requestedChatViewerId =
    typeof resolvedSearchParams.chat === "string"
      ? resolvedSearchParams.chat
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
  const selectedStoreOrders = selectedStore
    ? ((await fetchQuery(
        api.orders.getOrdersByOwner,
        {
          ownerId: currentUser.id,
          storeId: selectedStore._id,
        },
        convexOptions,
      )) as Order[])
    : [];
  const storeChatThreads = selectedStore
    ? ((await fetchQuery(
        api.chat.getOwnerStoreChatThreads,
        {
          ownerId: currentUser.id,
          storeId: selectedStore._id,
        },
        convexOptions,
      )) as ChatThread[])
    : [];
  const selectedChatViewerId = storeChatThreads.find(
    (thread) => thread.viewerId === requestedChatViewerId,
  )
    ? requestedChatViewerId
    : storeChatThreads[0]?.viewerId;
  const selectedChatMessages =
    selectedStore && selectedChatViewerId
      ? ((await fetchQuery(
          api.chat.getOwnerStoreChatMessages,
          {
            ownerId: currentUser.id,
            storeId: selectedStore._id,
            viewerId: selectedChatViewerId,
          },
          convexOptions,
        )) as ChatMessage[])
      : [];

  return (
    <DashboardShell
      currentUser={currentUser}
      selectedChatMessages={selectedChatMessages}
      selectedChatViewerId={selectedChatViewerId}
      selectedStoreId={selectedStore?._id}
      selectedStoreOrders={selectedStoreOrders}
      selectedStoreProducts={selectedStoreProducts as Product[]}
      storeChatThreads={storeChatThreads}
      stores={stores}
    />
  );
}
