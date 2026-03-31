import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";

import { api } from "@vendorly/convex";
import type { MarketplaceProduct } from "@vendorly/utils";

import { ProductPageShell } from "@/components/product-page-shell";
import { getConvexServerOptions } from "@/lib/convex";
import {
  buildSocialMetadata,
  trimMetadataText,
} from "@/lib/metadata";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

async function getProductMetadataRecord(productId: string) {
  try {
    return (await fetchQuery(
      api.products.getProductById,
      {
        productId,
      },
      getConvexServerOptions(),
    )) as MarketplaceProduct | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductMetadataRecord(resolvedParams.productId);

  if (!product) {
    const title = "Product | Vendorly";
    const description =
      "View a single Vendorly product, add it to cart, and chat with the seller from one dedicated page.";

    return {
      title,
      ...buildSocialMetadata({
        description,
        imagePath: `/product/${resolvedParams.productId}/opengraph-image`,
        pathname: `/product/${resolvedParams.productId}`,
        title,
      }),
    };
  }

  const title = `${product.title} | ${product.store?.name ?? "Vendorly"}`;
  const description =
    trimMetadataText(product.description, 160) ??
    "View this Vendorly product and ask the seller questions before you buy.";

  return {
    title,
    ...buildSocialMetadata({
      description,
      imagePath: `/product/${product._id}/opengraph-image`,
      pathname: `/product/${product._id}`,
      title,
    }),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;

  return <ProductPageShell productId={resolvedParams.productId} />;
}
