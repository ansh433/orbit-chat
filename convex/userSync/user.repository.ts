import type { Doc } from "../_generated/dataModel";
import type { DatabaseReader, MutationCtx } from "../_generated/server";

interface ClerkUserAttributes {
  clerkId: string;
  name: string;
}

/** Insert or update the user identified by a Clerk user ID. */
export async function upsertClerkUser(
  ctx: MutationCtx,
  attributes: ClerkUserAttributes,
): Promise<void> {
  const user = await findUserByClerkId(ctx.db, attributes.clerkId);

  if (user === null) {
    await ctx.db.insert("users", attributes);
    return;
  }

  await ctx.db.patch(user._id, attributes);
}

/** Delete the user identified by a Clerk user ID when it exists. */
export async function deleteClerkUser(
  ctx: MutationCtx,
  clerkUserId: string,
): Promise<void> {
  const user = await findUserByClerkId(ctx.db, clerkUserId);

  if (user === null) {
    console.warn(
      "Can't delete user, there is none for Clerk user ID: " + clerkUserId,
    );
    return;
  }

  await ctx.db.delete(user._id);
}

/** Find a synchronized user by its Clerk user ID. */
export async function findUserByClerkId(
  database: DatabaseReader,
  clerkId: string,
): Promise<Doc<"users"> | null> {
  return await database
    .query("users")
    .withIndex("byClerkId", (query) => query.eq("clerkId", clerkId))
    .unique();
}
