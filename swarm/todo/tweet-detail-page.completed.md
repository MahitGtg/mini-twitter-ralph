# Tweet Detail Page

## Overview
Add a dedicated page for viewing a single tweet at `/tweet/[tweetId]`. This allows users to share tweets via permalink, view a tweet in isolation, and sets the foundation for future features like replies.

## Why This Is Needed
- **Permalinks**: Users can share direct links to specific tweets
- **SEO**: Individual tweet pages can be indexed by search engines
- **UX**: Users can click on a tweet to view it in focus
- **Foundation**: Sets up structure for future reply/comment functionality

## Implementation Tasks

### 1. Create the Tweet Detail Page Route
- Create `/src/app/tweet/[tweetId]/page.tsx`
- Fetch the single tweet by ID using `api.tweets.getTweetById`
- Display the tweet using existing `TweetCard` component
- Include proper loading skeleton
- Handle 404 case when tweet doesn't exist

### 2. Update TweetCard to Link to Detail Page
- Make tweet content or timestamp clickable
- Link to `/tweet/{tweetId}` 
- Only the content/timestamp should link (not the author info which links to profile)

### 3. Backend: Enhance getTweetById Query
- Update `getTweetById` in `convex/tweets.ts` to include author information
- Return author data alongside the tweet (matching the pattern used in `getUserTweets`)

### 4. Add Back Navigation
- Include a "Back" or breadcrumb navigation on the tweet detail page
- Or rely on browser back button with clear visual hierarchy

## File Changes

### New Files
- `src/app/tweet/[tweetId]/page.tsx` - Tweet detail page component

### Modified Files
- `convex/tweets.ts` - Update `getTweetById` to return author info
- `src/components/tweets/TweetCard.tsx` - Add link to tweet detail page

## Acceptance Criteria
- [ ] Navigating to `/tweet/{tweetId}` shows the tweet
- [ ] Loading state shows a skeleton while fetching
- [ ] 404 state shows when tweet doesn't exist
- [ ] TweetCard has clickable area linking to tweet detail
- [ ] Like/unlike works on the detail page
- [ ] Delete works on the detail page (if own tweet)
- [ ] Author link still navigates to profile page
- [ ] Page is responsive and matches existing design

## Testing Notes
- Verify navigation from feed to tweet detail and back
- Test with valid and invalid tweet IDs
- Test like/delete functionality on the detail page
- Verify author profile links still work correctly

## Done Notes
- Added tweet detail page with loading/404 states, back link, and TweetCard render.
- Updated TweetCard to link content/timestamp to permalink.
- Enhanced getTweetById to include author and adjusted tests.
