import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { isRecord } from "@/server/shared/unknown-value";

import {
  InvalidProviderKeyError,
  MissingProviderKeyError,
} from "./chat.errors";
import { completeChat } from "./complete-chat.service";
import type {
  CompleteChatInput,
  ConversationMessage,
  ModelParameters,
  ProviderApiKeys,
  UploadedAttachment,
} from "./chat.types";

class InvalidChatRequestError extends Error {}

/** Translate a chat HTTP request into the complete-chat use case. */
export async function createChatCompletionController(
  request: NextRequest,
): Promise<Response> {
  const { userId } = await getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const input = parseChatRequest(await request.json(), userId);
    const completion = await completeChat(input);

    if (completion.kind === "image") {
      return emptyDataStreamResponse();
    }

    return completion.stream.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
    });
  } catch (error) {
    return chatErrorResponse(error);
  }
}

function parseChatRequest(value: unknown, userId: string): CompleteChatInput {
  if (!isRecord(value)) {
    throw new InvalidChatRequestError("Request body must be a JSON object.");
  }

  const messages = parseMessages(value.messages);
  if (messages.length === 0) {
    throw new InvalidChatRequestError("At least one message is required.");
  }

  return {
    userId,
    threadId: requiredString(value.threadId, "threadId"),
    model: requiredString(value.model, "model"),
    messages,
    attachments: parseAttachments(value.attachments),
    apiKeys: parseApiKeys(value.apiKeys),
    isTheoMode: value.isTheoMode === true,
    modelParameters: parseModelParameters(value.modelParams),
  };
}

function parseMessages(value: unknown): ConversationMessage[] {
  if (!Array.isArray(value)) {
    throw new InvalidChatRequestError("messages must be an array.");
  }

  return value.map((message, index) => {
    if (!isRecord(message)) {
      throw new InvalidChatRequestError(`messages[${index}] is invalid.`);
    }

    const role = message.role;
    if (role !== "user" && role !== "assistant" && role !== "system") {
      throw new InvalidChatRequestError(`messages[${index}].role is invalid.`);
    }

    return {
      role,
      content: requiredString(message.content, `messages[${index}].content`),
    };
  });
}

function parseAttachments(value: unknown): UploadedAttachment[] {
  if (value === undefined || value === null) {
    return [];
  }

  const attachments = Array.isArray(value) ? value : [value];
  return attachments.map((attachment, index) => {
    if (!isRecord(attachment)) {
      throw new InvalidChatRequestError(`attachments[${index}] is invalid.`);
    }

    const size = attachment.size;
    if (typeof size !== "number" || !Number.isFinite(size) || size < 0) {
      throw new InvalidChatRequestError(
        `attachments[${index}].size is invalid.`,
      );
    }

    return {
      name: requiredString(attachment.name, `attachments[${index}].name`),
      size,
      type: requiredString(attachment.type, `attachments[${index}].type`),
      url: requiredString(attachment.url, `attachments[${index}].url`),
      key: requiredString(attachment.key, `attachments[${index}].key`),
    };
  });
}

function parseApiKeys(value: unknown): ProviderApiKeys {
  if (!isRecord(value)) {
    return {};
  }

  return {
    openai: optionalString(value.openai),
    openrouter: optionalString(value.openrouter),
    gemini: optionalString(value.gemini),
  };
}

function parseModelParameters(value: unknown): ModelParameters {
  if (!isRecord(value)) {
    return { temperature: 0.3 };
  }

  return {
    temperature: optionalNumber(value.temperature) ?? 0.3,
    topK: optionalNumber(value.topK),
    topP: optionalNumber(value.topP),
    reasoning: parseReasoning(value.reasoning),
  };
}

function parseReasoning(
  value: unknown,
): ModelParameters["reasoning"] | undefined {
  return value === "low" || value === "medium" || value === "high"
    ? value
    : undefined;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new InvalidChatRequestError(`${field} is required.`);
  }
  return value;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function emptyDataStreamResponse(): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(""));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function chatErrorResponse(error: unknown): NextResponse {
  if (error instanceof InvalidChatRequestError) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: error.message },
      { status: 400 },
    );
  }

  if (error instanceof MissingProviderKeyError) {
    return NextResponse.json(
      { error: "API_KEY_REQUIRED", message: error.message },
      { status: 400 },
    );
  }

  if (error instanceof InvalidProviderKeyError) {
    return NextResponse.json(
      { error: "INVALID_API_KEY", message: error.message },
      { status: 401 },
    );
  }

  console.error("Chat completion failed", error);
  return NextResponse.json(
    { error: "INTERNAL_ERROR", message: "Internal server error" },
    { status: 500 },
  );
}
