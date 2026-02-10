import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator, type PaginationResult } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const DEFAULT_LIKES_LIMIT = 50;

type LikedTweet = Doc<"tweets"> & {
  author: Doc<"users"> | null;
  likedAt: number;
};

type LikesDbCtx = {
  db: {
    get(id: Id<"tweets">): Promise<Doc<"tweets"> | null>;
    get(id: Id<"users">): Promise<Doc<"users"> | null>;
  };
};

const buildLikedTweets = async (
  ctx: LikesDbCtx,
  likes: Array<Doc<"likes">>,
): Promise<LikedTweet[]> => {
  const tweetsWithAuthors = await Promise.all(
    likes.map(async (like) => {
      const tweet = await ctx.db.get(like.tweetId);
      if (!tweet) {
        return null;
      }
      const author = await ctx.db.get(tweet.userId);
      return { ...tweet, author, likedAt: like.createdAt };
    }),
  );

  return tweetsWithAuthors.filter(
    (tweet): tweet is LikedTweet => tweet !== null,
  );
};

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

export const getLikedTweets = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? DEFAULT_LIKES_LIMIT);

    return buildLikedTweets(ctx, likes);
  },
});

export const getLikedTweetsPaginated = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (
    ctx,
    { userId, paginationOpts },
  ): Promise<PaginationResult<LikedTweet>> => {
    const likesResult = await ctx.db
      .query("likes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(paginationOpts);

    return {
      page: await buildLikedTweets(ctx, likesResult.page),
      isDone: likesResult.isDone,
      continueCursor: likesResult.continueCursor,
    };
  },
});
