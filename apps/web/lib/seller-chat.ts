const DEFAULT_DASHBOARD_URL = "http://localhost:3001/dashboard";

export function getSellerDashboardUrl() {
  return process.env.NEXT_PUBLIC_DASHBOARD_URL ?? DEFAULT_DASHBOARD_URL;
}

export function buildSellerDashboardChatHref(storeId: string, viewerId: string) {
  const url = new URL(getSellerDashboardUrl());

  url.searchParams.set("store", storeId);
  url.searchParams.set("chat", viewerId);

  return url.toString();
}
