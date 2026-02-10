# Feature: Profile Tweet Count

## Summary
Add tweet count display to user profile pages, showing how many tweets a user has posted. This is a standard Twitter/X feature that helps users understand a profile's activity level.

## Current State
- The `ProfileHeader` component shows follower and following counts
- No tweet count is displayed on user profiles
- The backend has `getUserTweets` query but no dedicated count endpoint

## Implementation

### 1. Backend: Add Tweet Count Query
Add a new query in `convex/tweets.ts`:

```typescript
export const getUserTweetCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const tweets = await ctx.db
      .query("tweets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return tweets.length;
  },
});
```

### 2. Frontend: Update ProfileHeader Component
Update `src/components/user/ProfileHeader.tsx` to:
1. Import and use the new `getUserTweetCount` query
2. Display tweet count alongside followers/following stats

Add query:
```typescript
const tweetCount = useQuery(api.tweets.getUserTweetCount, { userId: user._id });
```

Update stats display to include tweet count:
```tsx
<p className="mt-2 text-xs text-slate-500">
  <span>{tweetCount ?? 0} tweets</span>
  {" · "}
  <Link href={`/profile/${user.username}/followers`} className="hover:underline">
    {followerCount} followers
  </Link>
  {" · "}
  <Link href={`/profile/${user.username}/following`} className="hover:underline">
    {followingCount} following
  </Link>
</p>
```

## Testing
1. Verify tweet count appears on profile pages
2. Verify count updates when user posts/deletes tweets
3. Verify count shows 0 for users with no tweets
4. Verify loading state displays gracefully (show 0 or loading indicator)

## Files to Modify
- `mini-twitter/convex/tweets.ts` - Add `getUserTweetCount` query
- `mini-twitter/src/components/user/ProfileHeader.tsx` - Display tweet count

## Acceptance Criteria
- [ ] Tweet count query exists in backend
- [ ] Tweet count displays on profile pages
- [ ] Count is accurate and updates reactively
- [ ] UI matches existing stats styling (followers/following)

## Notes
- Added `getUserTweetCount` query and wired it into `ProfileHeader` stats display.
