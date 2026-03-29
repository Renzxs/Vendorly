type SyncUserInput = {
  authUserId: string;
  email: string;
  image?: string;
  name?: string;
};

export async function syncUserRecord(ctx: any, input: SyncUserInput) {
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_auth_user_id", (query: any) =>
      query.eq("authUserId", input.authUserId),
    )
    .unique();

  if (existingUser) {
    await ctx.db.patch(existingUser._id, {
      email: input.email,
      image: input.image,
      name: input.name,
    });

    return existingUser._id;
  }

  return await ctx.db.insert("users", input);
}

