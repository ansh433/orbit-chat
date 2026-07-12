import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

import { requiredEnvironmentValue } from "@/server/shared/environment";

/** Generate a short display title for a conversation's opening question. */
export async function generateThreadTitle(question: string): Promise<string> {
  const groq = createGroq({
    apiKey: requiredEnvironmentValue("GROQ_API_KEY"),
  });
  const { text } = await generateText({
    model: groq("openai/gpt-oss-20b"),
    prompt: [
      "Generate a concise title for the question below.",
      "Return only a three-to-five-word title without quotes or formatting.",
      'Return exactly "New Chat" when the question cannot be summarized.',
      "",
      `Question: ${question}`,
    ].join("\n"),
  });

  return text.trim() || "New Chat";
}
