import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import { requiredEnvironmentValue } from "@/server/shared/environment";

let convexClient: ConvexHttpClient | undefined;

/** Return whether the user owns the requested thread. */
export async function isOwnedThreadAvailable(
  userId: string,
  threadId: string,
): Promise<boolean> {
  return getConvexClient().query(api.threads.isThreadExists, {
    userId,
    threadId,
  });
}

/** Rename a thread owned by the supplied user. */
export async function renameOwnedThread(
  userId: string,
  threadId: string,
  title: string,
): Promise<void> {
  await getConvexClient().mutation(api.threads.updateThread, {
    userId,
    threadId,
    title,
  });
}

function getConvexClient(): ConvexHttpClient {
  convexClient ??= new ConvexHttpClient(
    requiredEnvironmentValue("NEXT_PUBLIC_CONVEX_URL"),
  );
  return convexClient;
}
