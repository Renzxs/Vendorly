import { fetchQuery } from "convex/nextjs";

import { api } from "@vendorly/convex";
import type { MarketplaceProduct } from "@vendorly/utils";

import { getConvexServerOptions } from "@/lib/convex";
import { trimMetadataText } from "@/lib/metadata";
import {
  createVendorlyOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image";

export const runtime = "nodejs";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type ProductOpenGraphImageProps = {
  params: Promise<{ productId: string }>;
};

async function getProduct(productId: string) {
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

export default async function ProductOpenGraphImage({
  params,
}: ProductOpenGraphImageProps) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    return createVendorlyOgImage({
      description: "Browse this product link on Vendorly.",
      eyebrow: "Vendorly Product",
      kicker: "Product link preview",
      title: "Vendorly Product",
    });
  }

  return createVendorlyOgImage({
    accentColor: product.store?.themeColor,
    description:
      trimMetadataText(product.description, 180) ??
      "View this product on Vendorly.",
    eyebrow: product.store?.name ?? "Vendorly Product",
    kicker: product.isSoldOut ? "Currently sold out" : "Available now",
    title: product.title,
  });
}
