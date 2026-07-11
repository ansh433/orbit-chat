import { createChatCompletionController } from "@/server/chat/chat.controller";

export const runtime = "edge";
export const POST = createChatCompletionController;
