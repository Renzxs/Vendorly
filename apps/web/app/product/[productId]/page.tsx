import type { Metadata } from "next";

import { ProductPageShell } from "@/components/product-page-shell";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export const metadata: Metadata = {
  title: "Product | Vendorly",
  description:
    "View a single Vendorly product, add it to cart, and chat with the seller from one dedicated page.",
};

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;

  return <ProductPageShell productId={resolvedParams.productId} />;
}
