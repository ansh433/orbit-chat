import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internalMutation, query, type QueryCtx } from "./_generated/server";
import {
  deleteClerkUser,
  findUserByClerkId,
  upsertClerkUser,
} from "./userSync/user.repository";

export const current = query({
  args: {},
  handler: getCurrentUser,
});

export const upsertFromClerk = internalMutation({
  args: {
    data: v.object({
      id: v.string(),
      first_name: v.string(),
      last_name: v.string(),
    }),
  },
  async handler(ctx, { data }): Promise<void> {
    await upsertClerkUser(ctx, {
      clerkId: data.id,
      name: data.first_name + " " + data.last_name,
    });
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }): Promise<void> {
    await deleteClerkUser(ctx, clerkUserId);
  },
});

/** Return the authenticated user or fail when no synchronized user exists. */
export async function getCurrentUserOrThrow(
  ctx: QueryCtx,
): Promise<Doc<"users">> {
  const userRecord = await getCurrentUser(ctx);
  if (userRecord === null) {
    throw new Error("Can't get current user");
  }

  return userRecord;
}

/** Return the authenticated user's synchronized record when available. */
export async function getCurrentUser(
  ctx: QueryCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }

  return await findUserByClerkId(ctx.db, identity.subject);
}
