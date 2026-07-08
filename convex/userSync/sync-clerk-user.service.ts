import type { WebhookEvent } from "@clerk/clerk-sdk-node";

import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

/** Synchronize application user state from a verified Clerk webhook event. */
export async function syncClerkUserFromWebhook(
  ctx: ActionCtx,
  event: WebhookEvent,
): Promise<void> {
  switch (event.type) {
    case "user.created":
    case "user.updated":
      await ctx.runMutation(internal.users.upsertFromClerk, {
        data: {
          id: event.data.id,
          first_name: event.data.first_name,
          last_name: event.data.last_name,
        },
      });
      return;

    case "user.deleted": {
      const clerkUserId = event.data.id;
      if (!clerkUserId) {
        throw new Error("Clerk user.deleted event is missing a user ID");
      }

      await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
      return;
    }

    default:
      console.info("Ignored Clerk webhook event", event.type);
  }
}
