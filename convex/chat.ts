import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ModelParamsValidator } from "./schema";

export const createChatBatch = mutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    title: v.string(),
    model: v.string(),
    userMessage: v.object({
      messageId: v.string(),
      content: v.string(),
      modelParams: v.optional(ModelParamsValidator),
    }),
    assistantMessage: v.object({
      messageId: v.string(),
      modelParams: v.optional(ModelParamsValidator),
    }),
    attachments: v.optional(
      v.array(
        v.object({
          attachmentId: v.string(),
          attachmentUrl: v.string(),
          fileName: v.string(),
          fileType: v.string(),
          fileSize: v.number(),
          fileKey: v.string(),
        }),
      ),
    ),
  },
  handler: async (
    ctx,
    {
      userId,
      threadId,
      title,
      model,
      userMessage,
      assistantMessage,
      attachments,
    },
  ) => {
    // 1. Ensure thread exists (upsert semantics)
    let thread = await ctx.db
      .query("threads")
      .withIndex("byUserIdAndThreadId", (q) =>
        q.eq("userId", userId).eq("threadId", threadId),
      )
      .unique();

    if (!thread) {
      const _id = await ctx.db.insert("threads", {
        userId,
        title,
        model,
        status: "generating",
        threadId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      // Fetch the newly created doc to keep consistent shape (not strictly needed)
      thread = await ctx.db.get(_id);
    }

    // 2. Insert user message
    await ctx.db.insert("messages", {
      userId,
      threadId,
      messageId: userMessage.messageId,
      role: "user",
      content: userMessage.content,
      model,
      status: "completed",
      modelParams: userMessage.modelParams,
      attachmentIds: (attachments || []).map((a) => a.attachmentId),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. Insert assistant placeholder
    await ctx.db.insert("messages", {
      userId,
      threadId,
      messageId: assistantMessage.messageId,
      role: "assistant",
      content: "",
      model,
      status: "thinking",
      modelParams: assistantMessage.modelParams,
      attachmentIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 4. Insert attachments (if any)
    if (attachments && attachments.length) {
      for (const a of attachments) {
        await ctx.db.insert("attachments", {
          userId,
          messageId: userMessage.messageId,
          attachmentId: a.attachmentId,
          attachmentUrl: a.attachmentUrl,
          fileName: a.fileName,
          fileType: a.fileType,
          fileSize: a.fileSize,
          fileKey: a.fileKey,
        });
      }
    }
  },
});
