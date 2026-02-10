import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_FEED_LIMIT = 50;

export const createTweet = mutation({
  args: { content: v.string() },
  handler: async (ctx, { content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Tweet cannot be empty");
    }
    if (trimmed.length > 300) {
      throw new Error("Tweet exceeds 300 characters");
    }
    return ctx.db.insert("tweets", {
      userId,
      content: trimmed,
      createdAt: Date.now(),
    });
  },
});

export const deleteTweet = mutation({
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
    if (tweet.userId !== userId) {
      throw new Error("Cannot delete another user's tweet");
    }
    await ctx.db.delete(tweetId);
    return tweetId;
  },
});

export const getTweetById = query({
  args: { tweetId: v.id("tweets") },
  handler: async (ctx, { tweetId }) => ctx.db.get(tweetId),
});

export const getUserTweets = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    return ctx.db
      .query("tweets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? DEFAULT_FEED_LIMIT);
  },
});

export const getFeed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", userId))
      .collect();
    const allowedIds = new Set([
      userId,
      ...follows.map((follow) => follow.followingId),
    ]);
    const candidates = await ctx.db
      .query("tweets")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit ?? DEFAULT_FEED_LIMIT);
    return candidates.filter((tweet) => allowedIds.has(tweet.userId));
  },
});
