import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";

import { api } from "@vendorly/convex";
import type { Store } from "@vendorly/utils";

import { StorefrontShell } from "@/components/storefront-shell";
import { getConvexServerOptions } from "@/lib/convex";
import { buildSocialMetadata, trimMetadataText } from "@/lib/metadata";

type StorefrontPageProps = {
  params: Promise<{ slug: string }>;
};

async function getStoreMetadataRecord(slug: string) {
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

export async function generateMetadata({
  params,
}: StorefrontPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const store = await getStoreMetadataRecord(resolvedParams.slug);

  if (!store) {
    const title = `${resolvedParams.slug} | Vendorly Storefront`;
    const description = "Explore a branded Vendorly storefront.";

    return {
      title,
      ...buildSocialMetadata({
        description,
        imagePath: `/store/${resolvedParams.slug}/opengraph-image`,
        pathname: `/store/${resolvedParams.slug}`,
        title,
      }),
    };
  }

  const title = `${store.name} | Vendorly Storefront`;
  const description =
    trimMetadataText(store.bio, 160) ??
    trimMetadataText(store.description, 160) ??
    "Explore this seller's storefront on Vendorly.";

  return {
    title,
    ...buildSocialMetadata({
      description,
      imagePath: `/store/${store.slug}/opengraph-image`,
      pathname: `/store/${store.slug}`,
      title,
    }),
  };
}

export default async function StorefrontPage({
  params,
}: StorefrontPageProps) {
  const resolvedParams = await params;

  return <StorefrontShell slug={resolvedParams.slug} />;
}
