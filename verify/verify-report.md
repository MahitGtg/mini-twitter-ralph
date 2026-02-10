# Verify Report - followers-following-lists

## Todo under test
- `followers-following-lists.completed.md`

## Backend
- **PASS** — `npm run test:run` (46/46)

## Playwright E2E
1) **ProfileHeader follower/following links:** PASS  
   - Links point to `/profile/mahitg/followers` and `/profile/mahitg/following`  
   - Screenshot: `verify/screenshots/profile-header-links.png`

2) **Followers page happy path:** PASS  
   - Heading: `@mahitg's Followers`, Back link to `/profile/mahitg`, list populated  
   - Screenshot: `verify/screenshots/followers-page-populated.png`

3) **Following page happy path:** PASS  
   - Heading: `@mahitg's Following`, Back link to `/profile/mahitg`, list populated  
   - Screenshot: `verify/screenshots/following-page-populated.png`

4) **Follow/Unfollow from list:** PASS  
   - Follow action toggled to `Unfollow`; Unfollow toggled back to `Follow`  
   - Screenshots: `verify/screenshots/follow-toggle-from-list.png`, `verify/screenshots/follow-toggle-from-list-unfollow.png`

5) **Empty states:** PASS  
   - Followers empty state: `No followers yet.`  
   - Following empty state: `Not following anyone yet.`  
   - Screenshots: `verify/screenshots/empty-followers.png`, `verify/screenshots/empty-following.png`

6) **Non-existent user:** PASS  
   - Followers + following pages show `User not found`  
   - Screenshots: `verify/screenshots/user-not-found-followers.png`, `verify/screenshots/user-not-found-following.png`

7) **Back link navigation:** PASS  
   - From followers page → `/profile/mahitg`  
   - From following page → `/profile/mahitg`

8) **Loading skeleton (informational):** PASS  
   - Observed `.animate-pulse` elements before data load

## Summary
- Total checks: 11
- Passed: 11
- Failed: 0
- Informational: 1

## Bugs for coder
- None found in this run.

## Refactor / UI-UX for coder
- Followers/Following pages: keep the Back link aligned with the header and improve spacing between header and list.
- `UserCard` in list views: keep Follow/Unfollow button width fixed to avoid layout shift.
