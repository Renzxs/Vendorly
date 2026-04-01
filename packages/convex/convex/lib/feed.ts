import { getFeedPostReactionSummary } from "./social";

export async function hydrateFeedPost(ctx: any, post: any, viewerId?: string) {
  return {
    ...post,
    ...(await getFeedPostReactionSummary(ctx, post._id, viewerId)),
  };
}
