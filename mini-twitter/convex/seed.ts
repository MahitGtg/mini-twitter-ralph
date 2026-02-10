import { internalMutation, mutation } from "./_generated/server";
import type { DatabaseWriter } from "./_generated/server";

type DemoUserSeed = {
  username: string;
  name: string;
  bio: string;
  email: string;
  avatarUrl: string;
};

const DEMO_USERS: DemoUserSeed[] = [
  {
    username: "demo_alice",
    name: "Alice Demo",
    bio: "Tech enthusiast and coffee lover.",
    email: "demo_alice@example.com",
    avatarUrl: "",
  },
  {
    username: "demo_bob",
    name: "Bob Builder",
    bio: "Building cool stuff on the internet.",
    email: "demo_bob@example.com",
    avatarUrl: "",
  },
  {
    username: "demo_carol",
    name: "Carol Creative",
    bio: "Designer, maker, dreamer.",
    email: "demo_carol@example.com",
    avatarUrl: "",
  },
  {
    username: "demo_dan",
    name: "Dan Developer",
    bio: "Code all day, debug all night.",
    email: "demo_dan@example.com",
    avatarUrl: "",
  },
  {
    username: "demo_eve",
    name: "Eve Explorer",
    bio: "Always curious, always learning.",
    email: "demo_eve@example.com",
    avatarUrl: "",
  },
];

const DEMO_TWEETS = [
  { userIndex: 0, content: "Excited to try this mini Twitter app!" },
  { userIndex: 1, content: "Shipping small wins today. Momentum matters." },
  { userIndex: 2, content: "Design tip: whitespace is a feature, not a bug." },
  { userIndex: 3, content: "Refactoring with coffee in hand." },
  { userIndex: 4, content: "Learning never stops. What are you reading?" },
  { userIndex: 0, content: "Hot take: keyboard shortcuts save hours each week." },
  { userIndex: 1, content: "Just fixed a tricky bug. It was a missing semicolon." },
  { userIndex: 2, content: "I love seeing thoughtful UX in small products." },
  { userIndex: 3, content: "Code review: be kind, be clear, be constructive." },
  { userIndex: 4, content: "Weekend project ideas? Drop them here." },
  {
    userIndex: 0,
    content: "Taking a break to brainstorm new features. Any requests?",
  },
  {
    userIndex: 1,
    content: "Deployed a tiny improvement that makes the app feel faster.",
  },
];

const DEMO_FOLLOWS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
  [2, 0],
  [2, 4],
  [3, 0],
  [3, 1],
  [4, 0],
  [4, 2],
];

const DEMO_LIKES: Array<{ userIndex: number; tweetIndex: number }> = [
  { userIndex: 0, tweetIndex: 1 },
  { userIndex: 0, tweetIndex: 3 },
  { userIndex: 0, tweetIndex: 5 },
  { userIndex: 1, tweetIndex: 0 },
  { userIndex: 1, tweetIndex: 2 },
  { userIndex: 1, tweetIndex: 4 },
  { userIndex: 1, tweetIndex: 6 },
  { userIndex: 2, tweetIndex: 0 },
  { userIndex: 2, tweetIndex: 3 },
  { userIndex: 2, tweetIndex: 7 },
  { userIndex: 2, tweetIndex: 9 },
  { userIndex: 3, tweetIndex: 1 },
  { userIndex: 3, tweetIndex: 4 },
  { userIndex: 3, tweetIndex: 8 },
  { userIndex: 3, tweetIndex: 10 },
  { userIndex: 4, tweetIndex: 2 },
  { userIndex: 4, tweetIndex: 5 },
  { userIndex: 4, tweetIndex: 6 },
  { userIndex: 4, tweetIndex: 9 },
  { userIndex: 4, tweetIndex: 11 },
];

async function seedDemoDataImpl(ctx: { db: DatabaseWriter }) {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", "demo_alice"))
    .first();

  if (existing) {
    return { status: "already_seeded" as const };
  }

  const now = Date.now();
  const userIds = await Promise.all(
    DEMO_USERS.map((user, index) =>
      ctx.db.insert("users", {
        username: user.username.toLowerCase(),
        name: user.name,
        bio: user.bio,
        email: user.email,
        avatarUrl: user.avatarUrl,
        image: user.avatarUrl || undefined,
        createdAt: now - index * 1000 * 60 * 60,
      }),
    ),
  );

  const tweetIds = await Promise.all(
    DEMO_TWEETS.map((tweet, index) =>
      ctx.db.insert("tweets", {
        userId: userIds[tweet.userIndex],
        content: tweet.content,
        createdAt: now - (index + 1) * 1000 * 60 * 60 * 12,
      }),
    ),
  );

  await Promise.all(
    DEMO_FOLLOWS.map(([followerIndex, followingIndex], index) =>
      ctx.db.insert("follows", {
        followerId: userIds[followerIndex],
        followingId: userIds[followingIndex],
        createdAt: now - (index + 1) * 1000 * 60 * 30,
      }),
    ),
  );

  await Promise.all(
    DEMO_LIKES.map((like, index) =>
      ctx.db.insert("likes", {
        userId: userIds[like.userIndex],
        tweetId: tweetIds[like.tweetIndex],
        createdAt: now - (index + 1) * 1000 * 60 * 10,
      }),
    ),
  );

  return {
    status: "seeded" as const,
    users: userIds.length,
    tweets: tweetIds.length,
    follows: DEMO_FOLLOWS.length,
    likes: DEMO_LIKES.length,
  };
}

export const seedDemoData = internalMutation({
  args: {},
  handler: async (ctx) => seedDemoDataImpl(ctx),
});

export const runSeed = mutation({
  args: {},
  handler: async (ctx) => seedDemoDataImpl(ctx),
});
