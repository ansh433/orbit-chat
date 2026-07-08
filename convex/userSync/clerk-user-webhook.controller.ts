import type { WebhookEvent } from "@clerk/clerk-sdk-node";
import { Webhook, type WebhookRequiredHeaders } from "svix";

import type { ActionCtx } from "../_generated/server";
import { syncClerkUserFromWebhook } from "./sync-clerk-user.service";

/** Verify and receive a Clerk user webhook over HTTP. */
export async function receiveClerkUserWebhook(
  ctx: ActionCtx,
  request: Request,
): Promise<Response> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");
    return new Response("Clerk webhook is not configured", { status: 500 });
  }

  const svixHeaders = readSvixHeaders(request.headers);
  if (svixHeaders === null) {
    return new Response("Missing required Svix headers", { status: 400 });
  }

  let event: WebhookEvent;
  try {
    event = await verifyClerkWebhook(request, webhookSecret, svixHeaders);
  } catch (error) {
    console.error("Clerk webhook signature verification failed", error);
    return new Response("Invalid Clerk webhook signature", { status: 400 });
  }

  try {
    await syncClerkUserFromWebhook(ctx, event);
  } catch (error) {
    console.error("Clerk user synchronization failed", error);
    return new Response("Unable to process Clerk webhook", { status: 500 });
  }

  return new Response(null, { status: 200 });
}

function readSvixHeaders(
  headers: Request["headers"],
): WebhookRequiredHeaders | null {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");

  if (!id || !timestamp || !signature) {
    return null;
  }

  return {
    "svix-id": id,
    "svix-timestamp": timestamp,
    "svix-signature": signature,
  };
}

async function verifyClerkWebhook(
  request: Request,
  webhookSecret: string,
  svixHeaders: WebhookRequiredHeaders,
): Promise<WebhookEvent> {
  const payload = await request.text();
  return new Webhook(webhookSecret).verify(
    payload,
    svixHeaders,
  ) as WebhookEvent;
}
