# Feed Pagination with Load More

## Summary

Add pagination support to all feed views (home feed, user tweets, liked tweets, search results) with a "Load More" button. Currently, all feeds are limited to a fixed number of items (50) with no way to see older content. This is a critical UX improvement as the app scales.

## Problem

- All feed queries use `.take(limit ?? 50)` and return at most 50 items
- Users cannot access older tweets beyond the initial batch
- As the app grows, users will miss content from followed users
- No cursor-based pagination is implemented

## Proposed Solution

Implement cursor-based pagination using Convex's pagination patterns:

### 1. Backend: Update feed queries (`convex/tweets.ts`)

Add paginated versions of feed queries using cursor-based pagination:

```typescript
import { paginationOptsValidator, type PaginationResult } from "convex/server";

export const getFeedPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }): Promise<PaginationResult<TweetWithAuthor>> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", userId))
      .collect();
    const allowedIds = new Set([userId, ...follows.map((f) => f.followingId)]);
    
    // Paginate all tweets, then filter
    const result = await ctx.db
      .query("tweets")
      .withIndex("by_createdAt")
      .order("desc")
      .paginate(paginationOpts);
    
    const filteredPage = result.page.filter((t) => allowedIds.has(t.userId));
    const withAuthors = await addAuthors(ctx, filteredPage);
    
    return {
      page: withAuthors,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const getUserTweetsPaginated = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { userId, paginationOpts }) => {
    const result = await ctx.db
      .query("tweets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(paginationOpts);
    
    const withAuthors = await addAuthors(ctx, result.page);
    return {
      page: withAuthors,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});
```

### 2. Backend: Update likes query (`convex/likes.ts`)

Add paginated version of liked tweets query:

```typescript
export const getLikedTweetsPaginated = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { userId, paginationOpts }) => {
    // Get paginated likes
    const likesResult = await ctx.db
      .query("likes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(paginationOpts);
    
    // Fetch associated tweets
    const tweets = await Promise.all(
      likesResult.page.map(async (like) => {
        const tweet = await ctx.db.get(like.tweetId);
        if (!tweet) return null;
        const author = await ctx.db.get(tweet.userId);
        return { ...tweet, author };
      })
    );
    
    return {
      page: tweets.filter(Boolean),
      isDone: likesResult.isDone,
      continueCursor: likesResult.continueCursor,
    };
  },
});
```

### 3. Frontend: Create usePaginatedFeed hook (`src/hooks/usePaginatedFeed.ts`)

```typescript
import { useState, useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const PAGE_SIZE = 20;

export function usePaginatedFeed(feedType: "home" | "user" | "likes", userId?: Id<"users">) {
  const queryFn = feedType === "home" 
    ? api.tweets.getFeedPaginated
    : feedType === "user"
    ? api.tweets.getUserTweetsPaginated
    : api.likes.getLikedTweetsPaginated;
  
  const args = feedType === "home" ? {} : { userId: userId! };
  
  const { results, status, loadMore } = usePaginatedQuery(
    queryFn,
    args,
    { initialNumItems: PAGE_SIZE }
  );
  
  const handleLoadMore = useCallback(() => {
    loadMore(PAGE_SIZE);
  }, [loadMore]);
  
  return {
    tweets: results ?? [],
    isLoading: status === "LoadingFirstPage",
    isLoadingMore: status === "LoadingMore",
    canLoadMore: status === "CanLoadMore",
    loadMore: handleLoadMore,
  };
}
```

### 4. Frontend: Update TweetFeed component (`src/components/tweets/TweetFeed.tsx`)

Add "Load More" button at the end of the feed:

```typescript
// Add to TweetFeed component after the tweet list
{canLoadMore && (
  <div className="flex justify-center pt-4">
    <button
      type="button"
      onClick={loadMore}
      disabled={isLoadingMore}
      className="rounded-full border border-sky-200 bg-sky-50 px-6 py-2 text-sm font-medium text-sky-600 transition hover:bg-sky-100 disabled:opacity-60"
    >
      {isLoadingMore ? "Loading..." : "Load more tweets"}
    </button>
  </div>
)}

{isDone && tweets.length > 0 && (
  <p className="pt-4 text-center text-sm text-slate-400">
    You've reached the end
  </p>
)}
```

## Files to Modify

1. `convex/tweets.ts` - Add `getFeedPaginated`, `getUserTweetsPaginated`
2. `convex/likes.ts` - Add `getLikedTweetsPaginated`
3. `src/hooks/usePaginatedFeed.ts` - Create new hook (new file)
4. `src/components/tweets/TweetFeed.tsx` - Use paginated hook and add Load More UI
5. `src/app/search/page.tsx` - Add pagination to tweet search results (optional)

## Testing

1. Navigate to home feed with > 20 tweets
2. Verify initial load shows first page
3. Click "Load More" button
4. Verify additional tweets are appended
5. Verify "You've reached the end" message when all tweets loaded
6. Test on user profile tweets tab
7. Test on user profile likes tab
8. Verify loading states during pagination

## Acceptance Criteria

- [ ] `getFeedPaginated` query returns paginated results with cursor
- [ ] `getUserTweetsPaginated` query returns paginated user tweets
- [ ] `getLikedTweetsPaginated` query returns paginated liked tweets
- [ ] TweetFeed shows "Load More" button when more content available
- [ ] Button shows loading state while fetching
- [ ] "You've reached the end" shown when no more content
- [ ] Existing non-paginated queries still work (backward compatible)
- [ ] Smooth UX with no duplicate tweets

## Notes

- Use Convex's built-in `usePaginatedQuery` hook for optimal reactive pagination
- Keep existing non-paginated queries for backward compatibility
- Default page size of 20 balances UX and performance
- Consider adding infinite scroll as a future enhancement (intersection observer)

## Completion Notes

- Added paginated feed, user, likes, and search queries plus UI "Load more" states.
- Introduced `usePaginatedFeed` hook and updated feed/search views.
- Added backend tests for paginated queries.
- `npx convex codegen` failed due to Node v18 regex flag support; rerun with Node 20+.
