import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const likeTweet = mutation({
  args: { tweetId: v.id("tweets") },
  handler: async (ctx, { tweetId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const tweet = await ctx.db.get(tweetId);
    if (!tweet) {
      throw new Error("Tweet not found");
    }
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_tweetId", (q) =>
        q.eq("userId", userId).eq("tweetId", tweetId),
      )
      .first();
    if (existing) {
      return existing._id;
    }
    return ctx.db.insert("likes", {
      userId,
      tweetId,
      createdAt: Date.now(),
    });
  },
});

export const unlikeTweet = mutation({
  args: { tweetId: v.id("tweets") },
  handler: async (ctx, { tweetId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_tweetId", (q) =>
        q.eq("userId", userId).eq("tweetId", tweetId),
      )
      .first();
    if (!existing) {
      return null;
    }
    await ctx.db.delete(existing._id);
    return existing._id;
  },
});

export const getTweetLikes = query({
  args: { tweetId: v.id("tweets") },
  handler: async (ctx, { tweetId }) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_tweetId", (q) => q.eq("tweetId", tweetId))
      .collect();
    return likes.length;
  },
});

export const hasLiked = query({
  args: { tweetId: v.id("tweets") },
  handler: async (ctx, { tweetId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_tweetId", (q) =>
        q.eq("userId", userId).eq("tweetId", tweetId),
      )
      .first();
    return Boolean(existing);
  },
});
