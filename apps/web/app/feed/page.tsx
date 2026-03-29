import type { Metadata } from "next";

import { ProductFeedShell } from "@/components/product-feed-shell";

export const metadata: Metadata = {
  title: "Vendorly Feed | Product drops and reactions",
  description:
    "Follow Vendorly storefronts, react to products, and browse the latest product feed across the marketplace.",
};

export default function ProductFeedPage() {
  return <ProductFeedShell />;
}
