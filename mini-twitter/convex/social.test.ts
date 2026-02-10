import { convexTest } from "convex-test";
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

describe("social", () => {
  it("rejects follow when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, "target@example.com");

    await expect(
      t.mutation(api.social.follow, { userId }),
    ).rejects.toThrowError("Not authenticated");
  });

  it("rejects self-follow", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, "self@example.com");
    const asUser = t.withIdentity({ subject: userId });

    await expect(
      asUser.mutation(api.social.follow, { userId }),
    ).rejects.toThrowError("Cannot follow yourself");
  });

  it("creates follow relationships and is idempotent", async () => {
    const t = convexTest(schema, modules);
    const followerId = await createUser(t, "follower@example.com");
    const followingId = await createUser(t, "following@example.com");
    const asFollower = t.withIdentity({ subject: followerId });

    const first = await asFollower.mutation(api.social.follow, { userId: followingId });
    const second = await asFollower.mutation(api.social.follow, { userId: followingId });

    expect(first).toBe(second);
    const following = await t.query(api.social.getFollowing, { userId: followerId });
    expect(following).toHaveLength(1);
  });

  it("unfollows a user", async () => {
    const t = convexTest(schema, modules);
    const followerId = await createUser(t, "follower@example.com");
    const followingId = await createUser(t, "following@example.com");
    const asFollower = t.withIdentity({ subject: followerId });

    await asFollower.mutation(api.social.follow, { userId: followingId });
    const removed = await asFollower.mutation(api.social.unfollow, { userId: followingId });

    expect(removed).not.toBeNull();
    const following = await t.query(api.social.getFollowing, { userId: followerId });
    expect(following).toHaveLength(0);
  });

  it("returns follower and following lists", async () => {
    const t = convexTest(schema, modules);
    const followerId = await createUser(t, "follower@example.com");
    const followingId = await createUser(t, "following@example.com");
    const asFollower = t.withIdentity({ subject: followerId });

    await asFollower.mutation(api.social.follow, { userId: followingId });

    const followers = await t.query(api.social.getFollowers, { userId: followingId });
    const following = await t.query(api.social.getFollowing, { userId: followerId });

    expect(followers).toHaveLength(1);
    expect(following).toHaveLength(1);
  });

  it("returns followers with user data", async () => {
    const t = convexTest(schema, modules);
    const followerId = await createUser(t, "follower@example.com");
    const followingId = await createUser(t, "following@example.com");
    const asFollower = t.withIdentity({ subject: followerId });

    await asFollower.mutation(api.social.follow, { userId: followingId });

    const followers = await t.query(api.social.getFollowersWithUsers, {
      userId: followingId,
    });

    expect(followers).toHaveLength(1);
    expect(followers[0]?._id).toBe(followerId);
    expect(followers[0]?.username).toBe("follower");
  });

  it("returns following with user data", async () => {
    const t = convexTest(schema, modules);
    const followerId = await createUser(t, "follower@example.com");
    const followingId = await createUser(t, "following@example.com");
    const asFollower = t.withIdentity({ subject: followerId });

    await asFollower.mutation(api.social.follow, { userId: followingId });

    const following = await t.query(api.social.getFollowingWithUsers, {
      userId: followerId,
    });

    expect(following).toHaveLength(1);
    expect(following[0]?._id).toBe(followingId);
    expect(following[0]?.username).toBe("following");
  });

  it("returns empty follower/following lists with no data", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, "empty@example.com");

    const followers = await t.query(api.social.getFollowersWithUsers, { userId });
    const following = await t.query(api.social.getFollowingWithUsers, { userId });

    expect(followers).toEqual([]);
    expect(following).toEqual([]);
  });

  it("filters deleted users from follower/following lists", async () => {
    const t = convexTest(schema, modules);
    const followerId = await createUser(t, "follower@example.com");
    const followingId = await createUser(t, "following@example.com");
    const asFollower = t.withIdentity({ subject: followerId });

    await asFollower.mutation(api.social.follow, { userId: followingId });
    await t.run((ctx) => ctx.db.delete(followerId));
    await t.run((ctx) => ctx.db.delete(followingId));

    const followers = await t.query(api.social.getFollowersWithUsers, {
      userId: followingId,
    });
    const following = await t.query(api.social.getFollowingWithUsers, {
      userId: followerId,
    });

    expect(followers).toEqual([]);
    expect(following).toEqual([]);
  });

  it("reports isFollowing state", async () => {
    const t = convexTest(schema, modules);
    const followerId = await createUser(t, "follower@example.com");
    const followingId = await createUser(t, "following@example.com");
    const asFollower = t.withIdentity({ subject: followerId });

    await asFollower.mutation(api.social.follow, { userId: followingId });

    const isFollowing = await asFollower.query(api.social.isFollowing, {
      userId: followingId,
    });
    const anonIsFollowing = await t.query(api.social.isFollowing, {
      userId: followingId,
    });

    expect(isFollowing).toBe(true);
    expect(anonIsFollowing).toBe(false);
  });
});
