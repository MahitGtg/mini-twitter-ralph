import { getAuthUserId } from "@convex-dev/auth/server";
import {
  paginationOptsValidator,
  type PaginationOptions,
  type PaginationResult,
} from "convex/server";
import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const DEFAULT_FEED_LIMIT = 50;

type TweetWithAuthor<TTweet extends { userId: Id<"users"> }> = TTweet & {
  author: Doc<"users"> | null;
};

const addAuthors = async <TTweet extends { userId: Id<"users"> }>(
  ctx: { db: { get: (id: Id<"users">) => Promise<Doc<"users"> | null> } },
  tweets: TTweet[],
): Promise<Array<TweetWithAuthor<TTweet>>> =>
  Promise.all(
    tweets.map(async (tweet) => ({
      ...tweet,
      author: await ctx.db.get(tweet.userId),
    })),
  );

/**
 * Runs a single paginated query and filters the page. Convex allows only one
 * paginated query per function, so we cannot loop to fill numItems when
 * filtering; the returned page may be smaller than numItems.
 */
const paginateFilteredTweets = (
  ctx: QueryCtx,
  paginationOpts: PaginationOptions,
  filter: (tweet: Doc<"tweets">) => boolean,
): Promise<PaginationResult<Doc<"tweets">>> => {
  return ctx.db
    .query("tweets")
    .withIndex("by_createdAt")
    .order("desc")
    .paginate(paginationOpts)
    .then((result) => ({
      page: result.page.filter(filter),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    }));
};

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
  handler: async (ctx, { tweetId }) => {
    const tweet = await ctx.db.get(tweetId);
    if (!tweet) {
      return null;
    }
    const [withAuthor] = await addAuthors(ctx, [tweet]);
    return withAuthor ?? null;
  },
});

export const getUserTweetCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const tweets = await ctx.db
      .query("tweets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return tweets.length;
  },
});

export const getUserTweets = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    const tweets = await ctx.db
      .query("tweets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? DEFAULT_FEED_LIMIT);
    return addAuthors(ctx, tweets);
  },
});

export const getUserTweetsPaginated = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (
    ctx,
    { userId, paginationOpts },
  ): Promise<PaginationResult<TweetWithAuthor<Doc<"tweets">>>> => {
    const result = await ctx.db
      .query("tweets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(paginationOpts);
    const withAuthors = await addAuthors(ctx, result.page);
    return {
      page: withAuthors,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
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
    const tweets = candidates.filter((tweet) => allowedIds.has(tweet.userId));
    return addAuthors(ctx, tweets);
  },
});

export const getFeedPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (
    ctx,
    { paginationOpts },
  ): Promise<PaginationResult<TweetWithAuthor<Doc<"tweets">>>> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", userId))
      .collect();
    const allowedIds = new Set([
      userId,
      ...follows.map((follow) => follow.followingId),
    ]);

    const result = await paginateFilteredTweets(ctx, paginationOpts, (tweet) =>
      allowedIds.has(tweet.userId),
    );
    const withAuthors = await addAuthors(ctx, result.page);
    return {
      page: withAuthors,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const searchTweets = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const searchLower = query.toLowerCase().trim();
    if (!searchLower) {
      return [];
    }
    const candidates = await ctx.db
      .query("tweets")
      .withIndex("by_createdAt")
      .order("desc")
      .take(200);
    const matches = candidates
      .filter((tweet) => tweet.content.toLowerCase().includes(searchLower))
      .slice(0, 50);
    return addAuthors(ctx, matches);
  },
});

export const searchTweetsPaginated = query({
  args: { query: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (
    ctx,
    { query, paginationOpts },
  ): Promise<PaginationResult<TweetWithAuthor<Doc<"tweets">>>> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const searchLower = query.toLowerCase().trim();
    if (!searchLower) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const result = await paginateFilteredTweets(ctx, paginationOpts, (tweet) =>
      tweet.content.toLowerCase().includes(searchLower),
    );
    const withAuthors = await addAuthors(ctx, result.page);
    return {
      page: withAuthors,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});
