import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";

export const createSharedChat = mutation({
  args: {
    threadId: v.string(),
    ownerId: v.string(),
    title: v.string(),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { threadId, ownerId, title, isPublic = true }) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("byUserIdAndThreadId", (q) =>
        q.eq("userId", ownerId).eq("threadId", threadId),
      )
      .unique();

    if (!thread) {
      throw new Error(
        "Thread not found or you don't have permission to share it",
      );
    }

    const shareId = crypto.randomUUID();

    const sharedChatId = await ctx.db.insert("sharedChats", {
      shareId,
      threadId,
      ownerId,
      title,
      isPublic,
      createdAt: Date.now(),
    });

    return { shareId, id: sharedChatId };
  },
});

export const getSharedChat = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, { shareId }) => {
    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("byShareId", (q) => q.eq("shareId", shareId))
      .unique();

    return sharedChat && isSharedChatAvailable(sharedChat) ? sharedChat : null;
  },
});

export const getSharedChatMessages = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, { shareId }) => {
    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("byShareId", (q) => q.eq("shareId", shareId))
      .unique();

    if (!sharedChat || !isSharedChatAvailable(sharedChat)) {
      throw new Error("Shared chat not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("byThreadId", (q) => q.eq("threadId", sharedChat.threadId))
      .collect();

    return {
      sharedChat,
      messages: messages.sort((a, b) => a.createdAt - b.createdAt),
    };
  },
});

export const getUserSharedChats = query({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, { ownerId }) => {
    const sharedChats = await ctx.db
      .query("sharedChats")
      .withIndex("byOwnerId", (q) => q.eq("ownerId", ownerId))
      .collect();

    return sharedChats.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const deleteSharedChat = mutation({
  args: {
    shareId: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, { shareId, ownerId }) => {
    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("byShareId", (q) => q.eq("shareId", shareId))
      .unique();

    if (!sharedChat) {
      throw new Error("Shared chat not found");
    }

    if (sharedChat.ownerId !== ownerId) {
      throw new Error("You don't have permission to delete this shared chat");
    }

    await ctx.db.delete(sharedChat._id);
    return true;
  },
});

export const updateSharedChat = mutation({
  args: {
    shareId: v.string(),
    ownerId: v.string(),
    title: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { shareId, ownerId, title, isPublic, expiresInDays },
  ) => {
    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("byShareId", (q) => q.eq("shareId", shareId))
      .unique();

    if (!sharedChat) {
      throw new Error("Shared chat not found");
    }

    if (sharedChat.ownerId !== ownerId) {
      throw new Error("You don't have permission to update this shared chat");
    }

    const updates: Partial<
      Pick<Doc<"sharedChats">, "title" | "isPublic" | "expiresAt">
    > = {};

    if (title !== undefined) updates.title = title;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (expiresInDays !== undefined) {
      updates.expiresAt = expiresInDays
        ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000
        : undefined;
    }

    await ctx.db.patch(sharedChat._id, updates);
    return true;
  },
});

function isSharedChatAvailable(sharedChat: Doc<"sharedChats">): boolean {
  const isExpired =
    sharedChat.expiresAt !== undefined && sharedChat.expiresAt <= Date.now();

  return sharedChat.isPublic && !isExpired;
}
