import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { GoogleGenAI, Modality } from "@google/genai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";

import {
  InvalidProviderKeyError,
  MissingProviderKeyError,
} from "./chat.errors";
import type { ProviderApiKeys } from "./chat.types";

export const OPENAI_IMAGE_MODEL = "gpt-image-1";
export const GEMINI_IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation";

const GROQ_MODELS = new Set(["openai/gpt-oss-20b"]);

/** Select the configured language model for a chat request. */
export function selectLanguageModel(model: string, apiKeys: ProviderApiKeys) {
  if (GROQ_MODELS.has(model)) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new MissingProviderKeyError("Groq");
    }
    return createGroq({ apiKey })(model);
  }

  const apiKey = apiKeys.openrouter || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new MissingProviderKeyError("OpenRouter");
  }

  return createOpenRouter({ apiKey })(model);
}

/** Generate an image with the provider implied by the selected model. */
export async function generateAssistantImage(
  model: string,
  prompt: string,
  apiKeys: ProviderApiKeys,
): Promise<Uint8Array> {
  if (model === OPENAI_IMAGE_MODEL) {
    return generateOpenAiImage(prompt, apiKeys.openai);
  }

  if (model === GEMINI_IMAGE_MODEL) {
    return generateGeminiImage(prompt, apiKeys.gemini);
  }

  throw new Error(`${model} is not an image-generation model.`);
}

/** Return whether a model produces an image instead of streamed text. */
export function isImageGenerationModel(model: string): boolean {
  return model === OPENAI_IMAGE_MODEL || model === GEMINI_IMAGE_MODEL;
}

async function generateOpenAiImage(
  prompt: string,
  apiKey: string | undefined,
): Promise<Uint8Array> {
  if (!apiKey) {
    throw new MissingProviderKeyError("OpenAI");
  }

  try {
    const { image } = await generateImage({
      model: createOpenAI({ apiKey }).image(OPENAI_IMAGE_MODEL),
      prompt,
    });
    return decodeBase64(image.base64);
  } catch (error) {
    throw providerError("OpenAI", error);
  }
}

async function generateGeminiImage(
  prompt: string,
  apiKey: string | undefined,
): Promise<Uint8Array> {
  if (!apiKey) {
    throw new MissingProviderKeyError("Gemini");
  }

  try {
    const response = await new GoogleGenAI({ apiKey }).models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: prompt,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData?.data,
    );
    const imageData = imagePart?.inlineData?.data;

    if (!imageData) {
      throw new Error("Gemini returned no image data.");
    }

    return decodeBase64(imageData);
  } catch (error) {
    throw providerError("Gemini", error);
  }
}

function decodeBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function providerError(provider: "Gemini" | "OpenAI", error: unknown): Error {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const isAuthenticationFailure =
    message.includes("401") ||
    message.includes("unauthorized") ||
    message.includes("api key") ||
    message.includes("authentication");

  return isAuthenticationFailure
    ? new InvalidProviderKeyError(provider)
    : error instanceof Error
      ? error
      : new Error(`${provider} image generation failed.`);
}
