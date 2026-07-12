import { isOwnedThreadAvailable, renameOwnedThread } from "./thread.repository";
import { generateThreadTitle } from "./thread-title-generator";

const THREAD_LOOKUP_ATTEMPTS = 3;
const THREAD_LOOKUP_DELAY_MS = 500;

export class ThreadNotFoundError extends Error {
  constructor(threadId: string) {
    super(`Thread ${threadId} was not found.`);
    this.name = "ThreadNotFoundError";
  }
}

export interface NameThreadInput {
  userId: string;
  threadId: string;
  question: string;
}

/** Generate and persist a title for a newly-created conversation. */
export async function nameThread(input: NameThreadInput): Promise<string> {
  const title = await generateThreadTitle(input.question);
  const threadExists = await waitForOwnedThread(input.userId, input.threadId);

  if (!threadExists) {
    throw new ThreadNotFoundError(input.threadId);
  }

  await renameOwnedThread(input.userId, input.threadId, title);
  return title;
}

async function waitForOwnedThread(
  userId: string,
  threadId: string,
): Promise<boolean> {
  for (let attempt = 1; attempt <= THREAD_LOOKUP_ATTEMPTS; attempt += 1) {
    if (await isOwnedThreadAvailable(userId, threadId)) {
      return true;
    }

    if (attempt < THREAD_LOOKUP_ATTEMPTS) {
      await delay(THREAD_LOOKUP_DELAY_MS);
    }
  }

  return false;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
