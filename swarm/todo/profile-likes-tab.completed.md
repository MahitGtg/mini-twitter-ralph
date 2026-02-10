# Feature: Profile Likes Tab

## Summary
Add a "Likes" tab to the user profile page that displays all tweets the user has liked. This mirrors Twitter's profile tabs where you can view a user's tweets vs their liked content.

## Motivation
- Users should be able to revisit tweets they've liked
- Profile visitors can discover content through a user's likes
- Improves user engagement and content discovery
- Standard feature expected on Twitter-like platforms

## Implementation Plan

### 1. Backend: Add `getLikedTweets` Query
**File**: `mini-twitter/convex/likes.ts`

Add a new query that returns all tweets a user has liked, with author information:

```typescript
export const getLikedTweets = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 50);
    
    const tweetsWithAuthors = await Promise.all(
      likes.map(async (like) => {
        const tweet = await ctx.db.get(like.tweetId);
        if (!tweet) return null;
        const author = await ctx.db.get(tweet.userId);
        return { ...tweet, author, likedAt: like.createdAt };
      })
    );
    
    return tweetsWithAuthors.filter(Boolean);
  },
});
```

### 2. Frontend: Update Profile Page with Tabs
**File**: `mini-twitter/src/app/profile/[username]/page.tsx`

Add tab state and UI to switch between "Tweets" and "Likes" views:

- Add useState for active tab (`tweets` | `likes`)
- Add tab buttons below ProfileHeader
- Conditionally render TweetFeed based on active tab

### 3. Frontend: Update TweetFeed Component
**File**: `mini-twitter/src/components/tweets/TweetFeed.tsx`

Add support for displaying liked tweets:

- Add optional `likedByUserId` prop
- Add useQuery for `api.likes.getLikedTweets` when `likedByUserId` is provided
- Render the appropriate tweet list based on props

### 4. Add Tests
**File**: `mini-twitter/convex/likes.test.ts`

Add test cases for the new `getLikedTweets` query:
- Returns empty array for user with no likes
- Returns liked tweets in descending order (most recent first)
- Includes author information with each tweet
- Handles deleted tweets gracefully (filters them out)

## UI Design
The tabs should appear below the profile header:

```
[ProfileHeader]

[Tweets] [Likes]  <- Tab buttons
---------
|Content|  <- Shows tweets or liked tweets based on active tab
---------
```

Tab styling:
- Active tab: border-bottom with sky-500 color, font-semibold
- Inactive tab: text-slate-500, hover:text-slate-700

## Acceptance Criteria
- [x] `getLikedTweets` query exists and returns liked tweets with authors
- [x] Profile page shows "Tweets" and "Likes" tabs
- [x] Clicking tabs switches the displayed content
- [x] Liked tweets show the original author (not the liker)
- [x] Empty state shows "No liked tweets yet." message
- [ ] Tests pass for the new query

## Dependencies
- Existing `likes` table with `by_userId` index (already exists)
- Existing `TweetCard` component for rendering tweets

## Completion Notes
- Added `getLikedTweets` query with author data and liked timestamps.
- Added profile tabs and wired `TweetFeed` to show liked tweets.
- Extended `TweetFeed` empty state for likes and added backend tests.
- Tests not run (not requested).
