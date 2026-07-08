import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { MessageStatusValidator, ModelParamsValidator } from "./schema";

export const addMessage = mutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    messageId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(),
    model: v.string(),
    status: MessageStatusValidator,
    modelParams: v.optional(ModelParamsValidator),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      ...args,
      messageId: args.messageId,
      attachmentIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const patchMessage = mutation({
  args: {
    messageId: v.string(),
    content: v.optional(v.string()),
    status: v.optional(MessageStatusValidator),
    modelResponse: v.optional(v.string()),
  },
  handler: async (ctx, { messageId, content, status, modelResponse }) => {
    const msg = await ctx.db
      .query("messages")
      .withIndex("byMessageId", (q) => q.eq("messageId", messageId))
      .unique();
    if (!msg) throw new Error("message not found");

    const updatedAt = Date.now();
    await ctx.db.patch(msg._id, {
      ...(content !== undefined ? { content } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(modelResponse !== undefined ? { modelResponse } : {}),
      updatedAt,
    });

    if (status !== "completed" && status !== "error") {
      return;
    }

    const thread = await ctx.db
      .query("threads")
      .withIndex("byUserIdAndThreadId", (q) =>
        q.eq("userId", msg.userId).eq("threadId", msg.threadId),
      )
      .unique();

    if (thread) {
      await ctx.db.patch(thread._id, { status, updatedAt });
    }
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, { threadId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("byThreadId", (q) => q.eq("threadId", threadId))
      .collect();
  },
});
