import { convexTest } from "convex-test";
import { Id } from "convex/values";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "@/test/convexTestSetup";

const createUser = async (t: ReturnType<typeof convexTest>, email: string) =>
  t.run((ctx) =>
    ctx.db.insert("users", {
      email,
      username: email.split("@")[0] ?? "user",
      bio: "",
      avatarUrl: "",
      createdAt: Date.now(),
    }),
  );

const createTweet = async (
  t: ReturnType<typeof convexTest>,
  userId: Id<"users">,
  createdAt?: number,
) =>
  t.run((ctx) =>
    ctx.db.insert("tweets", {
      userId,
      content: "Hello",
      createdAt: createdAt ?? Date.now(),
    }),
  );

describe("likes", () => {
  it("rejects likeTweet when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, "owner@example.com");
    const tweetId = await createTweet(t, userId);

    await expect(
      t.mutation(api.likes.likeTweet, { tweetId }),
    ).rejects.toThrowError("Not authenticated");
  });

  it("rejects likeTweet when tweet does not exist", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, "liker@example.com");
    const tweetId = await createTweet(t, userId);
    await t.run((ctx) => ctx.db.delete(tweetId));

    const asUser = t.withIdentity({ subject: userId });
    await expect(
      asUser.mutation(api.likes.likeTweet, { tweetId }),
    ).rejects.toThrowError("Tweet not found");
  });

  it("creates likes and is idempotent", async () => {
    const t = convexTest(schema, modules);
    const ownerId = await createUser(t, "owner@example.com");
    const likerId = await createUser(t, "liker@example.com");
    const tweetId = await createTweet(t, ownerId);
    const asLiker = t.withIdentity({ subject: likerId });

    const firstLike = await asLiker.mutation(api.likes.likeTweet, { tweetId });
    const secondLike = await asLiker.mutation(api.likes.likeTweet, { tweetId });

    expect(firstLike).toBe(secondLike);
    const count = await t.query(api.likes.getTweetLikes, { tweetId });
    expect(count).toBe(1);
  });

  it("unlikes a tweet when liked", async () => {
    const t = convexTest(schema, modules);
    const ownerId = await createUser(t, "owner@example.com");
    const likerId = await createUser(t, "liker@example.com");
    const tweetId = await createTweet(t, ownerId);
    const asLiker = t.withIdentity({ subject: likerId });

    const likeId = await asLiker.mutation(api.likes.likeTweet, { tweetId });
    const removed = await asLiker.mutation(api.likes.unlikeTweet, { tweetId });

    expect(removed).toBe(likeId);
    const count = await t.query(api.likes.getTweetLikes, { tweetId });
    expect(count).toBe(0);
  });

  it("returns null when unliking a tweet that was not liked", async () => {
    const t = convexTest(schema, modules);
    const ownerId = await createUser(t, "owner@example.com");
    const likerId = await createUser(t, "liker@example.com");
    const tweetId = await createTweet(t, ownerId);
    const asLiker = t.withIdentity({ subject: likerId });

    const removed = await asLiker.mutation(api.likes.unlikeTweet, { tweetId });

    expect(removed).toBeNull();
  });

  it("counts likes across users", async () => {
    const t = convexTest(schema, modules);
    const ownerId = await createUser(t, "owner@example.com");
    const likerA = await createUser(t, "a@example.com");
    const likerB = await createUser(t, "b@example.com");
    const tweetId = await createTweet(t, ownerId);

    await t.withIdentity({ subject: likerA }).mutation(api.likes.likeTweet, {
      tweetId,
    });
    await t.withIdentity({ subject: likerB }).mutation(api.likes.likeTweet, {
      tweetId,
    });

    const count = await t.query(api.likes.getTweetLikes, { tweetId });
    expect(count).toBe(2);
  });

  it("reports liked state with auth", async () => {
    const t = convexTest(schema, modules);
    const ownerId = await createUser(t, "owner@example.com");
    const likerId = await createUser(t, "liker@example.com");
    const tweetId = await createTweet(t, ownerId);

    const asLiker = t.withIdentity({ subject: likerId });
    await asLiker.mutation(api.likes.likeTweet, { tweetId });

    const liked = await asLiker.query(api.likes.hasLiked, { tweetId });
    const anonLiked = await t.query(api.likes.hasLiked, { tweetId });

    expect(liked).toBe(true);
    expect(anonLiked).toBe(false);
  });

  it("returns empty list when user has no likes", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, "viewer@example.com");

    const liked = await t.query(api.likes.getLikedTweets, { userId });

    expect(liked).toEqual([]);
  });

  it("returns liked tweets in reverse chronological order", async () => {
    const t = convexTest(schema, modules);
    const authorId = await createUser(t, "author@example.com");
    const likerId = await createUser(t, "liker@example.com");
    const tweetA = await createTweet(t, authorId);
    const tweetB = await createTweet(t, authorId);
    const asLiker = t.withIdentity({ subject: likerId });

    await asLiker.mutation(api.likes.likeTweet, { tweetId: tweetA });
    await asLiker.mutation(api.likes.likeTweet, { tweetId: tweetB });

    const liked = await t.query(api.likes.getLikedTweets, { userId: likerId });

    expect(liked).toHaveLength(2);
    expect(liked[0]?._id).toBe(tweetB);
    expect(liked[1]?._id).toBe(tweetA);
  });

  it("includes author data with liked tweets", async () => {
    const t = convexTest(schema, modules);
    const authorId = await createUser(t, "author@example.com");
    const likerId = await createUser(t, "liker@example.com");
    const tweetId = await createTweet(t, authorId);
    const asLiker = t.withIdentity({ subject: likerId });

    await asLiker.mutation(api.likes.likeTweet, { tweetId });

    const liked = await t.query(api.likes.getLikedTweets, { userId: likerId });

    expect(liked).toHaveLength(1);
    expect(liked[0]?.author?.username).toBe("author");
    expect(typeof liked[0]?.likedAt).toBe("number");
  });

  it("filters out liked tweets that were deleted", async () => {
    const t = convexTest(schema, modules);
    const authorId = await createUser(t, "author@example.com");
    const likerId = await createUser(t, "liker@example.com");
    const tweetId = await createTweet(t, authorId);
    const asLiker = t.withIdentity({ subject: likerId });

    await asLiker.mutation(api.likes.likeTweet, { tweetId });
    await t.run((ctx) => ctx.db.delete(tweetId));

    const liked = await t.query(api.likes.getLikedTweets, { userId: likerId });

    expect(liked).toEqual([]);
  });

  it("paginates liked tweets in reverse chronological order", async () => {
    const t = convexTest(schema, modules);
    const authorId = await createUser(t, "author@example.com");
    const likerId = await createUser(t, "liker@example.com");
    const tweetA = await createTweet(t, authorId, 1);
    const tweetB = await createTweet(t, authorId, 2);
    const tweetC = await createTweet(t, authorId, 3);
    await t.run((ctx) =>
      ctx.db.insert("likes", {
        userId: likerId,
        tweetId: tweetA,
        createdAt: 100,
      }),
    );
    await t.run((ctx) =>
      ctx.db.insert("likes", {
        userId: likerId,
        tweetId: tweetB,
        createdAt: 200,
      }),
    );
    await t.run((ctx) =>
      ctx.db.insert("likes", {
        userId: likerId,
        tweetId: tweetC,
        createdAt: 300,
      }),
    );

    const firstPage = await t.query(api.likes.getLikedTweetsPaginated, {
      userId: likerId,
      paginationOpts: { numItems: 2, cursor: null },
    });
    const secondPage = await t.query(api.likes.getLikedTweetsPaginated, {
      userId: likerId,
      paginationOpts: { numItems: 2, cursor: firstPage.continueCursor },
    });

    expect(firstPage.page).toHaveLength(2);
    expect(firstPage.isDone).toBe(false);
    expect(firstPage.page[0]?.likedAt).toBeGreaterThan(
      firstPage.page[1]?.likedAt ?? 0,
    );
    expect(secondPage.page).toHaveLength(1);
    expect(secondPage.isDone).toBe(true);
  });
});
