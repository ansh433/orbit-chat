import { streamText, type CoreMessage } from "ai";

import {
  ORBIT_CHAT_SYSTEM_PROMPT,
  THEO_MODE_SYSTEM_PROMPT,
} from "@/app/lib/prompts/system-prompts";
import { storeImage } from "@/server/infrastructure/image-storage";

import { MissingProviderKeyError } from "./chat.errors";
import {
  addAssistantImage,
  completeAssistantMessage,
  failAssistantMessage,
  startConversationTurn,
} from "./chat.repository";
import {
  GEMINI_IMAGE_MODEL,
  generateAssistantImage,
  isImageGenerationModel,
  OPENAI_IMAGE_MODEL,
  selectLanguageModel,
} from "./chat-models";
import type {
  CompleteChatInput,
  ConversationMessage,
  UploadedAttachment,
} from "./chat.types";

/** Complete one user turn with either a streamed answer or a generated image. */
export async function completeChat(input: CompleteChatInput) {
  const prompt = input.messages.at(-1)?.content;
  if (!prompt) {
    throw new Error("The latest user message must contain text.");
  }

  validateGenerationPrerequisites(input);
  const selectedModel = isImageGenerationModel(input.model)
    ? undefined
    : selectLanguageModel(input.model, input.apiKeys);
  const turn = await startConversationTurn(input);

  if (isImageGenerationModel(input.model)) {
    try {
      await generateAndSaveAssistantImage(
        input,
        turn.assistantMessageId,
        prompt,
      );
      return { kind: "image" as const };
    } catch (error) {
      await failAssistantMessage(turn.assistantMessageId);
      throw error;
    }
  }

  if (!selectedModel) {
    throw new Error(`No language model was selected for ${input.model}.`);
  }

  const stream = streamText({
    model: selectedModel,
    system: input.isTheoMode ? THEO_MODE_SYSTEM_PROMPT : ORBIT_CHAT_SYSTEM_PROMPT,
    messages: buildModelMessages(input.messages, input.attachments),
    topK: input.modelParameters.topK,
    topP: input.modelParameters.topP,
    temperature: input.modelParameters.temperature,
    onFinish: async ({ text }) => {
      await completeAssistantMessage(turn.assistantMessageId, text);
    },
    onError: async () => {
      await failAssistantMessage(turn.assistantMessageId);
    },
  });

  return { kind: "text" as const, stream };
}

function validateGenerationPrerequisites(input: CompleteChatInput): void {
  if (input.model === OPENAI_IMAGE_MODEL && !input.apiKeys.openai) {
    throw new MissingProviderKeyError("OpenAI");
  }

  if (input.model === GEMINI_IMAGE_MODEL && !input.apiKeys.gemini) {
    throw new MissingProviderKeyError("Gemini");
  }
}

async function generateAndSaveAssistantImage(
  input: CompleteChatInput,
  assistantMessageId: string,
  prompt: string,
): Promise<void> {
  const imageBytes = await generateAssistantImage(
    input.model,
    prompt,
    input.apiKeys,
  );
  const fileKey = `generated-images/${crypto.randomUUID()}.png`;
  const imageUrl = await storeImage({
    bytes: imageBytes,
    contentType: "image/png",
    key: fileKey,
  });

  await addAssistantImage(input.userId, assistantMessageId, {
    name: "generated-image.png",
    size: imageBytes.byteLength,
    type: "image/png",
    url: imageUrl,
    key: fileKey,
  });
  await completeAssistantMessage(assistantMessageId, "");
}

function buildModelMessages(
  messages: ConversationMessage[],
  attachments: UploadedAttachment[],
): CoreMessage[] {
  if (attachments.length === 0) {
    return messages;
  }

  const previousMessages = messages.slice(0, -1);
  const latestMessage = messages.at(-1);

  if (!latestMessage) {
    return previousMessages;
  }

  return [
    ...previousMessages,
    {
      role: "user",
      content: [
        { type: "text", text: latestMessage.content },
        ...attachments.map((attachment) => ({
          type: "image" as const,
          image: new globalThis.URL(attachment.url),
          mimeType: attachment.type,
        })),
      ],
    },
  ];
}
