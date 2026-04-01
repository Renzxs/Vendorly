"use server";

import { fetchMutation } from "convex/nextjs";

import { api } from "@vendorly/convex";
import type { ProductReaction } from "@vendorly/utils";

import { auth } from "@/auth";
import { getActionErrorMessage } from "@/lib/action-errors";
import { getConvexServerOptions } from "@/lib/convex";

async function requireAuthenticatedBuyer() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be signed in to do that.");
  }

  return {
    email: session.user.email ?? undefined,
    id: session.user.id,
    image: session.user.image ?? undefined,
    name: session.user.name ?? undefined,
  };
}

export async function toggleProductReactionAction(input: {
  productId: string;
  reaction: ProductReaction;
}) {
  try {
    const currentUser = await requireAuthenticatedBuyer();

    await fetchMutation(
      api.products.toggleProductReaction,
      {
        productId: input.productId,
        reaction: input.reaction,
        viewerId: currentUser.id,
      },
      getConvexServerOptions(),
    );

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getActionErrorMessage(error, "Unable to save reaction."),
    };
  }
}

export async function toggleStoreFollowAction(input: { storeId: string }) {
  try {
    const currentUser = await requireAuthenticatedBuyer();

    await fetchMutation(
      api.stores.toggleStoreFollow,
      {
        storeId: input.storeId,
        viewerId: currentUser.id,
      },
      getConvexServerOptions(),
    );

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getActionErrorMessage(error, "Unable to update follow state."),
    };
  }
}

export async function sendViewerStoreMessageAction(input: {
  body: string;
  productId?: string;
  productTitle?: string;
  storeId: string;
}) {
  try {
    const currentUser = await requireAuthenticatedBuyer();

    await fetchMutation(
      api.chat.sendViewerStoreMessage,
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

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getActionErrorMessage(error, "Unable to send message."),
    };
  }
}

export async function createFeedPostAction(input: { body: string }) {
  try {
    const currentUser = await requireAuthenticatedBuyer();

    await fetchMutation(
      api.feed.createFeedPost,
      {
        body: input.body,
        viewerId: currentUser.id,
        viewerImage: currentUser.image,
        viewerName: currentUser.name ?? currentUser.email,
      },
      getConvexServerOptions(),
    );

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getActionErrorMessage(error, "Unable to publish your post."),
    };
  }
}

export async function markBuyerNotificationsReadAction() {
  try {
    const currentUser = await requireAuthenticatedBuyer();

    await fetchMutation(
      api.notifications.markAllRead,
      {
        recipientRole: "buyer",
        userId: currentUser.id,
      },
      getConvexServerOptions(),
    );

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getActionErrorMessage(
        error,
        "Unable to update your notifications.",
      ),
    };
  }
}
