Implemented user search and discovery UI plus Convex queries.

- Added `searchUsers` and `getSuggestedUsers` queries in `mini-twitter/convex/users.ts`.
- Created search page at `mini-twitter/src/app/search/page.tsx` with debounce, loading, and empty states.
- Added `WhoToFollow` component and integrated into home/search right rail.
- Updated `UserCard` to support `compact` and `currentUserId` (hides follow for self).
- Added Search link to sidebar navigation.
