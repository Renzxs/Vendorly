import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";

import { api } from "@vendorly/convex";
import type { VendorlyUser } from "@vendorly/utils";

import { UserProfileShell } from "@/components/user-profile-shell";
import { getConvexServerOptions } from "@/lib/convex";
import { buildSocialMetadata } from "@/lib/metadata";

type UserProfilePageProps = {
  params: Promise<{ userId: string }>;
};

async function getUserMetadataRecord(userId: string) {
  try {
    return (await fetchQuery(
      api.users.getUserByAuthUserId,
      {
        authUserId: userId,
      },
      getConvexServerOptions(),
    )) as VendorlyUser | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: UserProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const user = await getUserMetadataRecord(resolvedParams.userId);

  if (!user) {
    const title = "User | Vendorly";
    const description =
      "View a Vendorly user profile with recent posts, stores, and products.";

    return {
      title,
      ...buildSocialMetadata({
        description,
        pathname: `/user/${resolvedParams.userId}`,
        title,
      }),
    };
  }

  const displayName = user.name || user.email || "Vendorly user";
  const title = `${displayName} | Vendorly`;
  const description = `View recent posts, stores, and products from ${displayName} on Vendorly.`;

  return {
    title,
    ...buildSocialMetadata({
      description,
      pathname: `/user/${resolvedParams.userId}`,
      title,
    }),
  };
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const resolvedParams = await params;

  return <UserProfileShell userId={resolvedParams.userId} />;
}
