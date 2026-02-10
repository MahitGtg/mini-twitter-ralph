# Feature: Convex Backend Setup

## Priority: CRITICAL (blocks all other features)

## Problem
The PLAN.md shows many features as complete, but the actual codebase is just a Next.js starter template. The `mini-twitter/convex/` folder only contains auto-generated files - there's no schema, no auth, and no backend functions. Without this foundational infrastructure, no features can actually work.

## Goal
Set up the complete Convex backend infrastructure including database schema, authentication, and core API functions for the mini-twitter application.

## Dependencies
- None (this is the foundational task)

## Tasks

### 1. Install Required Dependencies
In the `mini-twitter/` directory:
```bash
npm install @convex-dev/auth @auth/core
```

Update `package.json` scripts to include:
```json
{
  "scripts": {
    "dev": "npm-run-all --parallel dev:next dev:convex",
    "dev:next": "next dev",
    "dev:convex": "convex dev"
  }
}
```

Also install `npm-run-all` as a dev dependency.

### 2. Create Convex Schema (`mini-twitter/convex/schema.ts`)
Define tables based on PRD.md:
- `users` - id, username, email, bio, avatarUrl, createdAt
- `tweets` - id, userId, content, createdAt
- `follows` - followerId, followingId, createdAt
- `likes` - userId, tweetId, createdAt

Use proper Convex indexes for efficient queries:
- `tweets` by userId, by createdAt
- `follows` by followerId, by followingId
- `likes` by tweetId, by userId

### 3. Set Up Convex Auth (`mini-twitter/convex/auth.ts` and `mini-twitter/convex/auth.config.ts`)
Configure password-based authentication using @convex-dev/auth:
- Email/password provider
- Session management
- User creation on signup

### 4. Create User Functions (`mini-twitter/convex/users.ts`)
- `getCurrentUser` - query to get the authenticated user's profile
- `getUserById` - query to get any user by ID
- `getUserByUsername` - query to get user by username
- `updateProfile` - mutation to update username, bio, avatarUrl

### 5. Create Tweet Functions (`mini-twitter/convex/tweets.ts`)
- `createTweet` - mutation to post a new tweet (300 char limit)
- `deleteTweet` - mutation to delete own tweet
- `getTweetById` - query to get a single tweet
- `getUserTweets` - query to get all tweets by a user
- `getFeed` - query to get tweets from followed users (reverse chronological)

### 6. Create Social Functions (`mini-twitter/convex/social.ts`)
- `follow` - mutation to follow a user
- `unfollow` - mutation to unfollow a user
- `getFollowers` - query to get a user's followers
- `getFollowing` - query to get who a user follows
- `isFollowing` - query to check if current user follows target user

### 7. Create Like Functions (`mini-twitter/convex/likes.ts`)
- `likeTweet` - mutation to like a tweet
- `unlikeTweet` - mutation to unlike a tweet
- `getTweetLikes` - query to get like count for a tweet
- `hasLiked` - query to check if current user liked a tweet

### 8. Set Up Convex Client Provider
Create `mini-twitter/src/components/ConvexClientProvider.tsx` to wrap the app with Convex and Auth providers.

Update `mini-twitter/src/app/layout.tsx` to use the provider.

### 9. Initialize Convex Project
Run `npx convex dev` to:
- Initialize the Convex project if not already done
- Generate updated types in `convex/_generated/`
- Verify schema deploys successfully

## Acceptance Criteria
- [ ] All Convex functions compile without TypeScript errors
- [ ] Schema deploys to Convex successfully
- [ ] Auth flow works (can sign up, log in, log out)
- [ ] Basic CRUD operations work via Convex dashboard
- [ ] `npm run dev` starts both Next.js and Convex dev servers
- [ ] Generated API types are available for frontend use

## Notes
- Use Convex's built-in ID system, don't create custom IDs
- All mutations that modify user data should verify authentication
- Use proper Convex patterns (ctx.db, v.object, etc.)
- Follow the patterns from AGENTS.md for server-side data fetching

## Implementation Notes
- Added Convex schema, auth config, and core functions for users, tweets, social, and likes.
- Added Convex Auth provider wiring in the Next.js app layout.
- Installed auth dependencies and npm-run-all for parallel dev scripts.
- Did not run `npx convex dev` (long-running); should be run locally to generate types.
