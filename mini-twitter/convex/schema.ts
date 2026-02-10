import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const users = defineTable({
  name: v.optional(v.string()),
  image: v.optional(v.union(v.string(), v.null())),
  email: v.string(),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  username: v.string(),
  bio: v.string(),
  avatarUrl: v.string(),
  createdAt: v.number(),
})
  .index("email", ["email"])
  .index("phone", ["phone"])
  .index("by_username", ["username"]);

const tweets = defineTable({
  userId: v.id("users"),
  content: v.string(),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_createdAt", ["createdAt"])
  .index("by_userId_createdAt", ["userId", "createdAt"]);

const follows = defineTable({
  followerId: v.id("users"),
  followingId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_followerId", ["followerId"])
  .index("by_followingId", ["followingId"])
  .index("by_followerId_followingId", ["followerId", "followingId"]);

const likes = defineTable({
  userId: v.id("users"),
  tweetId: v.id("tweets"),
  createdAt: v.number(),
})
  .index("by_tweetId", ["tweetId"])
  .index("by_userId", ["userId"])
  .index("by_userId_tweetId", ["userId", "tweetId"]);

export default defineSchema({
  ...authTables,
  users,
  tweets,
  follows,
  likes,
});
