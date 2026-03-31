import { fetchQuery } from "convex/nextjs";

import { api } from "@vendorly/convex";
import type { Store } from "@vendorly/utils";

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

type StoreOpenGraphImageProps = {
  params: Promise<{ slug: string }>;
};

async function getStore(slug: string) {
  try {
    return (await fetchQuery(
      api.stores.getStoreBySlug,
      {
        slug,
      },
      getConvexServerOptions(),
    )) as Store | null;
  } catch {
    return null;
  }
}

export default async function StoreOpenGraphImage({
  params,
}: StoreOpenGraphImageProps) {
  const { slug } = await params;
  const store = await getStore(slug);

  if (!store) {
    return createVendorlyOgImage({
      description: "Explore a branded Vendorly storefront.",
      eyebrow: "Vendorly Storefront",
      kicker: "Store link preview",
      title: slug,
    });
  }

  return createVendorlyOgImage({
    accentColor: store.themeColor,
    description:
      trimMetadataText(store.bio, 180) ??
      trimMetadataText(store.description, 180) ??
      "Explore this seller's storefront on Vendorly.",
    eyebrow: store.name,
    kicker: `${store.layoutType === "list" ? "List" : "Grid"} storefront`,
    title: `${store.name} | Vendorly Storefront`,
  });
}
