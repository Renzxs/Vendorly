"use server";

import { fetchMutation } from "convex/nextjs";

import { internal } from "@vendorly/convex";
import type { ProductReaction } from "@vendorly/utils";

import { auth } from "@/auth";
import { getConvexServerOptions } from "@/lib/convex";

async function requireAuthenticatedBuyer() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be signed in to do that.");
  }

  return {
    email: session.user.email ?? undefined,
    id: session.user.id,
    name: session.user.name ?? undefined,
  };
}

export async function toggleProductReactionAction(input: {
  productId: string;
  reaction: ProductReaction;
}) {
  const currentUser = await requireAuthenticatedBuyer();

  return await fetchMutation(
    internal.products.toggleProductReaction,
    {
      productId: input.productId,
      reaction: input.reaction,
      viewerId: currentUser.id,
    },
    getConvexServerOptions(),
  );
}

export async function toggleStoreFollowAction(input: { storeId: string }) {
  const currentUser = await requireAuthenticatedBuyer();

  return await fetchMutation(
    internal.stores.toggleStoreFollow,
    {
      storeId: input.storeId,
      viewerId: currentUser.id,
    },
    getConvexServerOptions(),
  );
}

export async function sendViewerStoreMessageAction(input: {
  body: string;
  productId?: string;
  productTitle?: string;
  storeId: string;
}) {
  const currentUser = await requireAuthenticatedBuyer();

  return await fetchMutation(
    internal.chat.sendViewerStoreMessage,
    {
      body: input.body,
      productId: input.productId,
      productTitle: input.productTitle,
      storeId: input.storeId,
      viewerId: currentUser.id,
      viewerName: currentUser.name ?? currentUser.email,
    },
    getConvexServerOptions(),
  );
}
