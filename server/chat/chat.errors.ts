export type AiProvider = "Gemini" | "Groq" | "OpenAI" | "OpenRouter";

export class MissingProviderKeyError extends Error {
  constructor(readonly provider: AiProvider) {
    super(`${provider} API key is required for this model.`);
    this.name = "MissingProviderKeyError";
  }
}

export class InvalidProviderKeyError extends Error {
  constructor(readonly provider: AiProvider) {
    super(`The ${provider} API key was rejected.`);
    this.name = "InvalidProviderKeyError";
  }
}
