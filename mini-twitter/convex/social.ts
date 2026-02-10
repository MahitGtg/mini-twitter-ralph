import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type FollowUser = Doc<"users"> & { followedAt: number };
type FollowDoc = Doc<"follows">;
type FollowUserField = "followerId" | "followingId";

const getFollowUsers = async (
  ctx: QueryCtx,
  follows: FollowDoc[],
  userField: FollowUserField,
): Promise<FollowUser[]> => {
  const users = await Promise.all(
    follows.map(async (follow) => {
      const user = await ctx.db.get(follow[userField]);
      if (!user) {
        return null;
      }
      return { ...user, followedAt: follow.createdAt };
    }),
  );

  return users.filter((user): user is FollowUser => user !== null);
};

export const follow = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const followerId = await getAuthUserId(ctx);
    if (!followerId) {
      throw new Error("Not authenticated");
    }
    if (followerId === userId) {
      throw new Error("Cannot follow yourself");
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_followerId_followingId", (q) =>
        q.eq("followerId", followerId).eq("followingId", userId),
      )
      .first();
    if (existing) {
      return existing._id;
    }
    return ctx.db.insert("follows", {
      followerId,
      followingId: userId,
      createdAt: Date.now(),
    });
  },
});

export const unfollow = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const followerId = await getAuthUserId(ctx);
    if (!followerId) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_followerId_followingId", (q) =>
        q.eq("followerId", followerId).eq("followingId", userId),
      )
      .first();
    if (!existing) {
      return null;
    }
    await ctx.db.delete(existing._id);
    return existing._id;
  },
});

export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", userId))
      .collect();
  },
});

export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", userId))
      .collect();
  },
});

export const getFollowersWithUsers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", userId))
      .order("desc")
      .collect();

    return getFollowUsers(ctx, follows, "followerId");
  },
});

export const getFollowingWithUsers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", userId))
      .order("desc")
      .collect();

    return getFollowUsers(ctx, follows, "followingId");
  },
});

export const isFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const followerId = await getAuthUserId(ctx);
    if (!followerId) {
      return false;
    }
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_followerId_followingId", (q) =>
        q.eq("followerId", followerId).eq("followingId", userId),
      )
      .first();
    return Boolean(existing);
  },
});
