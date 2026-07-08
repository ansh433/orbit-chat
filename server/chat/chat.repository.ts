import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import { requiredEnvironmentValue } from "@/server/shared/environment";

import type {
  CompleteChatInput,
  ConversationTurn,
  UploadedAttachment,
} from "./chat.types";

let convexClient: ConvexHttpClient | undefined;

/** Persist the user message and reserve an assistant message atomically. */
export async function startConversationTurn(
  input: CompleteChatInput,
): Promise<ConversationTurn> {
  const userMessageId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

  await getConvexClient().mutation(api.chat.createChatBatch, {
    userId: input.userId,
    threadId: input.threadId,
    title: "New Chat",
    model: input.model,
    userMessage: {
      messageId: userMessageId,
      content: input.messages.at(-1)?.content ?? "",
      modelParams: input.modelParameters,
    },
    assistantMessage: {
      messageId: assistantMessageId,
      modelParams: input.modelParameters,
    },
    attachments: input.attachments.map((attachment) => ({
      attachmentId: crypto.randomUUID(),
      attachmentUrl: attachment.url,
      fileName: attachment.name,
      fileType: attachment.type,
      fileSize: attachment.size,
      fileKey: attachment.key,
    })),
  });

  return { userMessageId, assistantMessageId };
}

/** Mark the reserved assistant message as successfully completed. */
export async function completeAssistantMessage(
  messageId: string,
  content: string,
): Promise<void> {
  await getConvexClient().mutation(api.messages.patchMessage, {
    messageId,
    content,
    status: "completed",
  });
}

/** Mark the reserved assistant message as failed. */
export async function failAssistantMessage(messageId: string): Promise<void> {
  await getConvexClient().mutation(api.messages.patchMessage, {
    messageId,
    status: "error",
  });
}

/** Attach a generated image to an assistant message. */
export async function addAssistantImage(
  userId: string,
  messageId: string,
  attachment: UploadedAttachment,
): Promise<void> {
  await getConvexClient().mutation(api.attachments.addAttachment, {
    userId,
    messageId,
    attachmentId: crypto.randomUUID(),
    attachmentUrl: attachment.url,
    fileName: attachment.name,
    fileType: attachment.type,
    fileSize: attachment.size,
    fileKey: attachment.key,
  });
}

function getConvexClient(): ConvexHttpClient {
  convexClient ??= new ConvexHttpClient(
    requiredEnvironmentValue("NEXT_PUBLIC_CONVEX_URL"),
  );

  return convexClient;
}
