import type { Metadata } from "next";

import { StorefrontShell } from "@/components/storefront-shell";

type StorefrontPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: StorefrontPageProps): Promise<Metadata> {
  const resolvedParams = await params;

  return {
    title: `${resolvedParams.slug} | Vendorly Storefront`,
  };
}

export default async function StorefrontPage({
  params,
}: StorefrontPageProps) {
  const resolvedParams = await params;

  return <StorefrontShell slug={resolvedParams.slug} />;
}
