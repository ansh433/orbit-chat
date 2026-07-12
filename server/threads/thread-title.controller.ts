import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { isRecord } from "@/server/shared/unknown-value";

import { nameThread, ThreadNotFoundError } from "./name-thread.service";

class InvalidThreadTitleRequestError extends Error {}

/** Translate an HTTP request into the name-thread use case. */
export async function nameThreadController(
  request: NextRequest,
): Promise<NextResponse> {
  const { userId } = await getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = parseThreadTitleRequest(await request.json());
    const title = await nameThread({ userId, ...input });
    return NextResponse.json({ success: true, title });
  } catch (error) {
    if (error instanceof InvalidThreadTitleRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof ThreadNotFoundError) {
      return NextResponse.json(
        { error: "Thread not found", details: error.message },
        { status: 404 },
      );
    }

    console.error("Thread title generation failed", error);
    return NextResponse.json(
      { error: "Failed to update thread title" },
      { status: 500 },
    );
  }
}

function parseThreadTitleRequest(value: unknown): {
  threadId: string;
  question: string;
} {
  if (!isRecord(value)) {
    throw new InvalidThreadTitleRequestError(
      "Request body must be a JSON object.",
    );
  }

  return {
    threadId: requiredString(value.threadId, "threadId"),
    question: requiredString(value.question, "question"),
  };
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new InvalidThreadTitleRequestError(`${field} is required.`);
  }
  return value;
}
