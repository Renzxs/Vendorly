import { fetchQuery } from "convex/nextjs";

import { api } from "@vendorly/convex";
import type { Order } from "@vendorly/utils";

import { OrdersPageShell } from "@/components/orders-page-shell";
import { requireWebUser } from "@/lib/current-user";
import { getConvexServerOptions } from "@/lib/convex";

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const currentUser = await requireWebUser("/orders");
  const convexOptions = getConvexServerOptions();
  const orders = (await fetchQuery(
    api.orders.getViewerOrders,
    {
      buyerId: currentUser.id,
    },
    convexOptions,
  )) as Order[];
  const resolvedSearchParams = await searchParams;
  const placed = resolvedSearchParams.placed === "1";

  return <OrdersPageShell orders={orders} placed={placed} />;
}
