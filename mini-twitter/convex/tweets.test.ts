import { convexTest } from "convex-test";
import { Id } from "convex/values";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "@/test/convexTestSetup";

const createUser = async (t: ReturnType<typeof convexTest>) =>
  t.run((ctx) =>
    ctx.db.insert("users", {
      email: "user@example.com",
      username: `user-${Math.random().toString(16).slice(2)}`,
      bio: "",
      avatarUrl: "",
      createdAt: Date.now(),
    }),
  );

const createTweet = async (
  t: ReturnType<typeof convexTest>,
  userId: Id<"users">,
  content = "Hello",
  createdAt?: number,
) =>
  t.run((ctx) =>
    ctx.db.insert("tweets", {
      userId,
      content,
      createdAt: createdAt ?? Date.now(),
    }),
  );

describe("tweets", () => {
  it("rejects createTweet when not authenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.tweets.createTweet, { content: "Hello" }),
    ).rejects.toThrowError("Not authenticated");
  });

  it("validates content length and emptiness", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t);
    const asUser = t.withIdentity({ subject: userId });

    await expect(
      asUser.mutation(api.tweets.createTweet, { content: "   " }),
    ).rejects.toThrowError("Tweet cannot be empty");
    await expect(
      asUser.mutation(api.tweets.createTweet, {
        content: "a".repeat(301),
      }),
    ).rejects.toThrowError("Tweet exceeds 300 characters");
  });

  it("creates a tweet with trimmed content", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t);
    const asUser = t.withIdentity({ subject: userId });

    const tweetId = await asUser.mutation(api.tweets.createTweet, {
      content: "  Hello world ",
    });
    const tweet = await t.query(api.tweets.getTweetById, { tweetId });

    expect(tweet?.content).toBe("Hello world");
    expect(tweet?.userId).toBe(userId);
    expect(tweet?.author?._id).toBe(userId);
  });

  it("rejects deleteTweet for invalid ownership", async () => {
    const t = convexTest(schema, modules);
    const ownerId = await createUser(t);
    const otherId = await createUser(t);
    const tweetId = await createTweet(t, ownerId);
    const asOther = t.withIdentity({ subject: otherId });

    await expect(
      asOther.mutation(api.tweets.deleteTweet, { tweetId }),
    ).rejects.toThrowError("Cannot delete another user's tweet");
  });

  it("rejects deleteTweet when tweet is missing", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t);
    const tweetId = await createTweet(t, userId);
    await t.run((ctx) => ctx.db.delete(tweetId));
    const asUser = t.withIdentity({ subject: userId });

    await expect(
      asUser.mutation(api.tweets.deleteTweet, { tweetId }),
    ).rejects.toThrowError("Tweet not found");
  });

  it("deletes own tweet", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t);
    const tweetId = await createTweet(t, userId);
    const asUser = t.withIdentity({ subject: userId });

    const deleted = await asUser.mutation(api.tweets.deleteTweet, { tweetId });
    const tweet = await t.query(api.tweets.getTweetById, { tweetId });

    expect(deleted).toBe(tweetId);
    expect(tweet).toBeNull();
  });

  it("returns an empty feed when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    const feed = await t.query(api.tweets.getFeed, {});

    expect(feed).toEqual([]);
  });

  it("returns own and followed users' tweets", async () => {
    const t = convexTest(schema, modules);
    const userA = await createUser(t);
    const userB = await createUser(t);
    const userC = await createUser(t);
    await createTweet(t, userA, "from-a");
    await createTweet(t, userB, "from-b");
    await createTweet(t, userC, "from-c");
    await t.run((ctx) =>
      ctx.db.insert("follows", {
        followerId: userA,
        followingId: userB,
        createdAt: Date.now(),
      }),
    );

    const asUserA = t.withIdentity({ subject: userA });
    const feed = await asUserA.query(api.tweets.getFeed, {});

    expect(feed).toHaveLength(2);
    expect(feed.every((tweet) => [userA, userB].includes(tweet.userId))).toBe(
      true,
    );
  });

  it("returns tweets for a specific user", async () => {
    const t = convexTest(schema, modules);
    const userA = await createUser(t);
    const userB = await createUser(t);
    await createTweet(t, userB, "one");
    await createTweet(t, userB, "two");
    await createTweet(t, userA, "ignore");

    const tweets = await t.query(api.tweets.getUserTweets, { userId: userB });

    expect(tweets).toHaveLength(2);
    expect(tweets.every((tweet) => tweet.userId === userB)).toBe(true);
  });

  it("paginates user tweets", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t);
    await createTweet(t, userId, "third", 3);
    await createTweet(t, userId, "second", 2);
    await createTweet(t, userId, "first", 1);

    const firstPage = await t.query(api.tweets.getUserTweetsPaginated, {
      userId,
      paginationOpts: { numItems: 2, cursor: null },
    });
    const secondPage = await t.query(api.tweets.getUserTweetsPaginated, {
      userId,
      paginationOpts: { numItems: 2, cursor: firstPage.continueCursor },
    });

    expect(firstPage.page).toHaveLength(2);
    expect(firstPage.isDone).toBe(false);
    expect(secondPage.page).toHaveLength(1);
    expect(secondPage.isDone).toBe(true);
  });

  it("paginates feed results for followed users", async () => {
    const t = convexTest(schema, modules);
    const userA = await createUser(t);
    const userB = await createUser(t);
    const userC = await createUser(t);
    await createTweet(t, userB, "from-b", 2);
    await createTweet(t, userC, "from-c", 3);
    await createTweet(t, userA, "from-a", 4);
    await t.run((ctx) =>
      ctx.db.insert("follows", {
        followerId: userA,
        followingId: userB,
        createdAt: Date.now(),
      }),
    );

    const asUserA = t.withIdentity({ subject: userA });
    const page = await asUserA.query(api.tweets.getFeedPaginated, {
      paginationOpts: { numItems: 2, cursor: null },
    });

    expect(page.page).toHaveLength(2);
    expect(page.page.every((tweet) => [userA, userB].includes(tweet.userId))).toBe(
      true,
    );
  });

  it("paginates search results", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t);
    await createTweet(t, userId, "Hello world", 1);
    await createTweet(t, userId, "Another post", 2);

    const asUser = t.withIdentity({ subject: userId });
    const page = await asUser.query(api.tweets.searchTweetsPaginated, {
      query: "hello",
      paginationOpts: { numItems: 2, cursor: null },
    });

    expect(page.page).toHaveLength(1);
    expect(page.page[0]?.content).toContain("Hello");
    expect(page.isDone).toBe(true);
  });
});
