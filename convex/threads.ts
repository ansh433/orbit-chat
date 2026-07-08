import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ThreadStatusValidator } from "./schema";

export const ensureThread = mutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    title: v.string(),
    model: v.string(),
    status: v.optional(ThreadStatusValidator),
  },
  handler: async (ctx, { userId, threadId, title, model, status }) => {
    if (threadId) {
      const thread = await ctx.db
        .query("threads")
        .withIndex("byUserIdAndThreadId", (q) =>
          q.eq("userId", userId).eq("threadId", threadId),
        )
        .unique();

      if (thread) {
        if (status !== undefined && thread.status !== status) {
          await ctx.db.patch(thread._id, {
            status,
            updatedAt: Date.now(),
          });
        }
        return thread._id;
      }

      const _id = await ctx.db.insert("threads", {
        userId,
        title,
        model,
        status: status ?? "generating",
        threadId: threadId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return _id;
    }
  },
});

export const updateThread = mutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    title: v.string(),
    status: v.optional(ThreadStatusValidator),
  },
  handler: async (ctx, { userId, threadId, title, status }) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("byUserIdAndThreadId", (q) =>
        q.eq("userId", userId).eq("threadId", threadId),
      )
      .unique();

    if (!thread) {
      throw new Error("Thread not found");
    }

    await ctx.db.patch(thread._id, {
      title,
      ...(status !== undefined ? { status } : {}),
      updatedAt: Date.now(),
    });

    return thread._id;
  },
});

export const getThread = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const threads = await ctx.db
      .query("threads")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();

    return threads;
  },
});

export const isThreadExists = query({
  args: {
    userId: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, { userId, threadId }) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("byUserIdAndThreadId", (q) =>
        q.eq("userId", userId).eq("threadId", threadId),
      )
      .unique();

    return !!thread;
  },
});

export const getThreadDetails = query({
  args: {
    userId: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, { userId, threadId }) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("byUserIdAndThreadId", (q) =>
        q.eq("userId", userId).eq("threadId", threadId),
      )
      .unique();

    return thread;
  },
});

export const deleteThread = mutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, { userId, threadId }) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("byUserIdAndThreadId", (q) =>
        q.eq("userId", userId).eq("threadId", threadId),
      )
      .unique();

    if (!thread) {
      throw new Error("Thread not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("byThreadId", (q) => q.eq("threadId", threadId))
      .collect();

    for (const message of messages) {
      const attachments = await ctx.db
        .query("attachments")
        .withIndex("byMessageId", (q) => q.eq("messageId", message.messageId))
        .collect();

      for (const attachment of attachments) {
        await ctx.db.delete(attachment._id);
      }
    }

    const sharedChats = await ctx.db
      .query("sharedChats")
      .withIndex("byThreadId", (q) => q.eq("threadId", threadId))
      .collect();

    for (const sharedChat of sharedChats) {
      await ctx.db.delete(sharedChat._id);
    }

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(thread._id);

    return true;
  },
});
