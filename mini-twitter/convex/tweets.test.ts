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
) =>
  t.run((ctx) =>
    ctx.db.insert("tweets", {
      userId,
      content,
      createdAt: Date.now(),
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
});
