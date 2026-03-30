import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type SyncUserInput = {
  authUserId: string;
  email: string;
  image?: string;
  name?: string;
};

type SyncUserResult = {
  userId: Id<"users">;
  wasCreated: boolean;
};

export async function syncUserRecord(
  ctx: MutationCtx,
  input: SyncUserInput,
): Promise<SyncUserResult> {
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_auth_user_id", (query) => query.eq("authUserId", input.authUserId))
    .unique();

  if (existingUser) {
    await ctx.db.patch(existingUser._id, {
      email: input.email,
      image: input.image,
      name: input.name,
    });

    return {
      userId: existingUser._id,
      wasCreated: false,
    };
  }

  return {
    userId: await ctx.db.insert("users", input),
    wasCreated: true,
  };
}

export async function syncUserRecordAndNotify(
  ctx: MutationCtx,
  input: SyncUserInput,
): Promise<SyncUserResult> {
  const syncedUser = await syncUserRecord(ctx, input);

  if (syncedUser.wasCreated) {
    await ctx.scheduler.runAfter(0, internal.discord.notifyNewUser, {
      authUserId: input.authUserId,
      email: input.email,
      name: input.name,
    });
  }

  return syncedUser;
}
