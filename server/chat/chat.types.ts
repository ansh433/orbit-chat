export type ChatRole = "user" | "assistant" | "system";

export interface ConversationMessage {
  role: ChatRole;
  content: string;
}

export interface ModelParameters {
  temperature: number;
  topK?: number;
  topP?: number;
  reasoning?: "low" | "medium" | "high";
}

export interface UploadedAttachment {
  name: string;
  size: number;
  type: string;
  url: string;
  key: string;
}

export interface ProviderApiKeys {
  openai?: string;
  openrouter?: string;
  gemini?: string;
}

export interface CompleteChatInput {
  userId: string;
  threadId: string;
  model: string;
  messages: ConversationMessage[];
  modelParameters: ModelParameters;
  attachments: UploadedAttachment[];
  apiKeys: ProviderApiKeys;
  isTheoMode: boolean;
}

export interface ConversationTurn {
  userMessageId: string;
  assistantMessageId: string;
}
