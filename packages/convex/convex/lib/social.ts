import { createReactionCounts, type ProductReaction } from "@vendorly/utils";

export async function getStoreFollowSummary(
  ctx: any,
  storeId: any,
  viewerId?: string,
) {
  const follows = await ctx.db
    .query("storeFollowers")
    .withIndex("by_store", (query: any) => query.eq("storeId", storeId))
    .collect();

  const viewerFollow = viewerId
    ? follows.find((follow: any) => follow.viewerId === viewerId)
    : null;

  return {
    followerCount: follows.length,
    isFollowed: Boolean(viewerFollow),
  };
}

export async function getFollowedStoreIds(ctx: any, viewerId?: string) {
  if (!viewerId) {
    return new Set<string>();
  }

  const follows = await ctx.db
    .query("storeFollowers")
    .withIndex("by_viewer", (query: any) => query.eq("viewerId", viewerId))
    .collect();

  return new Set(follows.map((follow: any) => String(follow.storeId)));
}

export async function getProductReactionSummary(
  ctx: any,
  productId: any,
  viewerId?: string,
) {
  const reactions = await ctx.db
    .query("productReactions")
    .withIndex("by_product", (query: any) => query.eq("productId", productId))
    .collect();

  const reactionCounts = createReactionCounts();

  for (const reaction of reactions) {
    reactionCounts[reaction.reaction as ProductReaction] += 1;
  }

  const viewerReaction = viewerId
    ? reactions.find((reaction: any) => reaction.viewerId === viewerId)?.reaction
    : undefined;

  return {
    reactionCount: reactions.length,
    reactionCounts,
    viewerReaction,
  };
}
