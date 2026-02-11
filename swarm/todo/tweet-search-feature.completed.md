# Tweet Search Feature

## Summary
Add the ability to search tweets by text content, completing the PLAN.md item: "Basic search results page (optional: search tweets by text)".

Currently, the `/search` page only allows searching for users by username/name. This feature adds a second tab to search tweets by their content text.

## Implementation Steps

### 1. Backend: Add tweet search query (`mini-twitter/convex/tweets.ts`)

Add a new query `searchTweets` that:
- Accepts a `query` string parameter
- Searches tweet content for matching text (case-insensitive)
- Returns tweets with author information attached
- Limits results to 50 tweets
- Requires authentication

```typescript
export const searchTweets = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const searchLower = query.toLowerCase().trim();
    if (!searchLower) {
      return [];
    }
    // Get recent tweets and filter by content match
    const candidates = await ctx.db
      .query("tweets")
      .withIndex("by_createdAt")
      .order("desc")
      .take(200);
    const matches = candidates.filter((tweet) =>
      tweet.content.toLowerCase().includes(searchLower)
    ).slice(0, 50);
    return addAuthors(ctx, matches);
  },
});
```

### 2. Frontend: Update search page (`mini-twitter/src/app/search/page.tsx`)

Modify the search page to include:
- A tab switcher for "Users" and "Tweets" search modes
- Tweet search results using the existing `TweetCard` component
- Maintain the existing user search functionality
- Use debounced search for both modes

Key changes:
- Add `searchMode` state: `"users" | "tweets"`
- Add `useQuery` for `api.tweets.searchTweets`
- Render tab buttons to switch between modes
- Display `TweetCard` components for tweet results

### 3. Update page title and placeholder

- When in "Tweets" mode, placeholder: "Search tweets..."
- When in "Users" mode, placeholder: "Search by username or name..."

## Files to Modify

1. `mini-twitter/convex/tweets.ts` - Add `searchTweets` query
2. `mini-twitter/src/app/search/page.tsx` - Add tabs and tweet search UI

## Testing

1. Navigate to `/search`
2. Verify default mode is "Users" (existing behavior preserved)
3. Click "Tweets" tab
4. Type a search query that matches existing tweet content
5. Verify matching tweets are displayed with proper TweetCard styling
6. Verify like/delete actions work on search results
7. Switch back to "Users" tab and verify user search still works

## Acceptance Criteria

- [ ] `searchTweets` query exists and returns matching tweets with authors
- [ ] Search page has "Users" and "Tweets" tabs
- [ ] Tweets tab shows tweet results using TweetCard component
- [ ] Search is debounced (300ms)
- [ ] Empty/loading/no-results states handled appropriately
- [ ] Tab state persists during the search session

## Notes

Implemented tweet search query with author hydration and added a two-tab search UI with tweet results, empty states, and tweet skeleton loading.
