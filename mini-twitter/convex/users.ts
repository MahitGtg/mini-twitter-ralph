import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return ctx.db.get(userId);
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => ctx.db.get(userId),
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const normalized = normalizeUsername(username);
    return ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .first();
  },
});

export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const updates: {
      username?: string;
      bio?: string;
      avatarUrl?: string;
      image?: string;
    } = {};

    if (args.username !== undefined) {
      const normalized = normalizeUsername(args.username);
      if (!normalized) {
        throw new Error("Username cannot be empty");
      }
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", normalized))
        .first();
      if (existing && existing._id !== userId) {
        throw new Error("Username is already taken");
      }
      updates.username = normalized;
    }

    if (args.bio !== undefined) {
      updates.bio = args.bio;
    }

    if (args.avatarUrl !== undefined) {
      updates.avatarUrl = args.avatarUrl;
      updates.image = args.avatarUrl || undefined;
    }

    if (Object.keys(updates).length === 0) {
      return ctx.db.get(userId);
    }

    await ctx.db.patch(userId, updates);
    return ctx.db.get(userId);
  },
});

export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query, limit }) => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) {
      return [];
    }

    const allUsers = await ctx.db.query("users").collect();
    return allUsers
      .filter(
        (user) =>
          user.username.toLowerCase().startsWith(searchTerm) ||
          (user.name && user.name.toLowerCase().includes(searchTerm)),
      )
      .slice(0, limit ?? 10);
  },
});

export const getSuggestedUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return ctx.db
        .query("users")
        .order("desc")
        .take(limit ?? 5);
    }

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", userId))
      .collect();
    const followingIds = new Set(follows.map((follow) => follow.followingId));
    followingIds.add(userId);

    const allUsers = await ctx.db.query("users").collect();
    return allUsers
      .filter((user) => !followingIds.has(user._id))
      .slice(0, limit ?? 5);
  },
});
