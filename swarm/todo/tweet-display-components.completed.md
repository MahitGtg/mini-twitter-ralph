# Feature: Tweet Display Components (TweetCard + TweetFeed)

## Priority: CRITICAL (App cannot display any tweets without these)

## Problem
The Mini Twitter app has a working backend and a TweetComposer component, but **there's no way to display tweets**. The two core components needed to show tweets in the feed are completely missing:
- `TweetCard.tsx` - Displays an individual tweet
- `TweetFeed.tsx` - Displays a list of tweets

Without these components, users cannot see any tweets - not their own, not from people they follow, nothing. The home page is still the default Next.js starter template.

## Goal
Create the TweetCard and TweetFeed components so tweets can be displayed throughout the app, then update the home page to show the actual tweet feed.

## Dependencies
- Convex backend setup (completed) - `tweets.ts`, `likes.ts` APIs exist
- TweetComposer (exists) - for posting tweets
- `useRelativeTime` hook (exists) - for timestamp formatting
- UserAvatar component (exists) - for displaying avatars

## Tasks

### 1. Create TweetCard Component (`mini-twitter/src/components/tweets/TweetCard.tsx`)

Display a single tweet with all its interactions.

```typescript
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import UserAvatar from "@/components/user/UserAvatar";
import { useRelativeTime } from "@/hooks/useRelativeTime";

interface TweetCardProps {
  tweet: Doc<"tweets">;
  author: Doc<"users"> | null;
  currentUserId?: Id<"users">;
}

export default function TweetCard({ tweet, author, currentUserId }: TweetCardProps) {
  // Features to implement:
  // - Display tweet content
  // - Show author avatar, username
  // - Show relative timestamp using useRelativeTime hook
  // - Like button with count (use api.likes.likeTweet, unlikeTweet, getTweetLikes, hasLiked)
  // - Delete button (only visible for own tweets, use api.tweets.deleteTweet)
  // - Loading states for like/delete actions
  // - Error handling with user feedback
}
```

Key requirements:
- Uses `useQuery(api.likes.getTweetLikes, { tweetId })` for like count
- Uses `useQuery(api.likes.hasLiked, { tweetId })` for like state
- Uses `useMutation(api.likes.likeTweet)` and `unlikeTweet`
- Uses `useMutation(api.tweets.deleteTweet)` with confirmation
- Clicking username/avatar links to user profile (when profile pages exist)
- Twitter-like card design with subtle borders and hover states

### 2. Create TweetFeed Component (`mini-twitter/src/components/tweets/TweetFeed.tsx`)

Display a list of tweets with loading and empty states.

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import TweetCard from "./TweetCard";

interface TweetFeedProps {
  // Either show home feed (for logged in user) or specific user's tweets
  userId?: Id<"users">;
  currentUserId?: Id<"users">;
}

export default function TweetFeed({ userId, currentUserId }: TweetFeedProps) {
  // If userId provided: use api.tweets.getUserTweets
  // Otherwise: use api.tweets.getFeed (home feed)
  
  // Features to implement:
  // - Loading skeleton while fetching
  // - Empty state message when no tweets
  // - List of TweetCard components
  // - Fetch author info for each tweet (may need a new API or join)
}
```

Key requirements:
- Conditionally uses `api.tweets.getFeed` or `api.tweets.getUserTweets`
- Shows loading skeleton while data loads
- Shows friendly empty state ("No tweets yet" / "Follow people to see tweets")
- Renders TweetCard for each tweet

### 3. Create Tweet Author Lookup (if needed)

The current `getFeed` and `getUserTweets` queries return tweets but not author info. We may need:

Option A: Modify existing queries to include author data (preferred for efficiency)
Option B: Create a helper query or fetch author in TweetFeed

Check `mini-twitter/convex/tweets.ts` and potentially add author data to responses:

```typescript
// In getFeed and getUserTweets, enrich with author:
const tweetsWithAuthors = await Promise.all(
  tweets.map(async (tweet) => ({
    ...tweet,
    author: await ctx.db.get(tweet.userId),
  }))
);
```

### 4. Update Home Page (`mini-twitter/src/app/page.tsx`)

Replace the default Next.js template with the actual Mini Twitter home page.

```typescript
"use client";

import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import TweetComposer from "@/components/tweets/TweetComposer";
import TweetFeed from "@/components/tweets/TweetFeed";
import SignInForm from "@/components/auth/SignInForm";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!isAuthenticated) {
    return <SignInPrompt />;
  }
  
  return (
    <MainLayout>
      <TweetComposer />
      <TweetFeed currentUserId={currentUser?._id} />
    </MainLayout>
  );
}
```

### 5. Add Loading Skeleton Component

Create a reusable loading skeleton for tweets:

```typescript
// mini-twitter/src/components/tweets/TweetSkeleton.tsx
export default function TweetSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
```

## UI Design

TweetCard should include:
- Avatar (left side, 40x40px)
- Username + timestamp (top right of content)
- Tweet content (main body)
- Action row: Like button (heart icon) with count, Delete button (trash icon, own tweets only)
- Subtle border, rounded corners, hover state
- Twitter-blue (#1DA1F2) for like when active

## Acceptance Criteria
- [ ] TweetCard displays tweet content, author, timestamp
- [ ] TweetCard shows like count and allows liking/unliking
- [ ] TweetCard shows delete button only for own tweets
- [ ] TweetFeed displays list of tweets or appropriate empty state
- [ ] TweetFeed shows loading skeleton while fetching
- [ ] Home page shows TweetComposer + TweetFeed when logged in
- [ ] Home page shows sign-in prompt when logged out
- [ ] Tweets appear in reverse chronological order
- [ ] All actions have appropriate loading states

## Notes
- Coordinate with `frontend-ui-implementation.pending.md` which has the broader UI plan
- This feature focuses specifically on the tweet display components
- Profile page integration can come later - for now, TweetCard can skip profile links
- Consider adding optimistic updates for like/unlike to feel snappy

## Completion Notes
- Added TweetCard, TweetFeed, and TweetSkeleton components with loading, empty, and error states.
- Enriched tweet feed/user tweet queries with author data.
- Replaced the default home page with authenticated feed + sign-in prompt.
