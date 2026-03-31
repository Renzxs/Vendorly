import type { Metadata } from "next";

export const SITE_NAME = "Vendorly";
export const DEFAULT_METADATA_TITLE =
  "Vendorly | Discover storefront-first commerce";
export const DEFAULT_METADATA_DESCRIPTION =
  "Vendorly is a customizable marketplace where sellers launch branded storefronts and buyers discover standout products.";

export function getMarketplaceUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? "http://localhost:3000";

  try {
    return new URL(candidate);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export function buildAbsoluteUrl(pathname = "/") {
  return new URL(pathname, getMarketplaceUrl()).toString();
}

type BuildMetadataInput = {
  description: string;
  imagePath?: string;
  pathname?: string;
  title: string;
};

export function buildSocialMetadata({
  description,
  imagePath = "/opengraph-image",
  pathname = "/",
  title,
}: BuildMetadataInput): Pick<Metadata, "description" | "openGraph" | "twitter"> {
  const imageUrl = buildAbsoluteUrl(imagePath);
  const pageUrl = buildAbsoluteUrl(pathname);

  return {
    description,
    openGraph: {
      description,
      images: [
        {
          alt: title,
          height: 630,
          url: imageUrl,
          width: 1200,
        },
      ],
      siteName: SITE_NAME,
      title,
      type: "website",
      url: pageUrl,
    },
    twitter: {
      card: "summary_large_image",
      description,
      images: [imageUrl],
      title,
    },
  };
}

export function trimMetadataText(value: string | undefined, maxLength = 160) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return undefined;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}
