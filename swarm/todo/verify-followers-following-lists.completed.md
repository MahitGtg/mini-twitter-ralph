# Verification Plan: Followers/Following Lists (from followers-following-lists.completed.md)
Summary: Backend + all E2E flows passed.

## Todo under test
**followers-following-lists.completed.md** — Adds clickable followers/following counts on user profiles that navigate to dedicated list pages. Includes:
1. **Backend queries** `getFollowersWithUsers` and `getFollowingWithUsers` in `convex/social.ts` that return full user objects (not just follow records), filtering out deleted users.
2. **Followers page** at `/profile/[username]/followers` showing a list of `UserCard` components for each follower, with loading skeleton, empty state, and back-link.
3. **Following page** at `/profile/[username]/following` — same structure for users the profile owner follows.
4. **ProfileHeader update** — follower/following counts are now `<Link>` elements with `hover:underline` that navigate to the respective list pages.
5. **Backend tests** in `convex/social.test.ts` covering: followers-with-users returns user data, following-with-users returns user data, empty lists, and deleted-user filtering.

## Backend tests
- **Run**: `cd mini-twitter && npm run test:run`
- **Relevant test file**: `convex/social.test.ts`
  - `returns followers with user data` — asserts `getFollowersWithUsers` returns `_id` and `username`
  - `returns following with user data` — asserts `getFollowingWithUsers` returns `_id` and `username`
  - `returns empty follower/following lists with no data` — asserts empty arrays
  - `filters deleted users from follower/following lists` — deletes users and asserts empty results
- Run the **full** test suite (not just social tests) to catch regressions.

## Playwright E2E flows (all features in this todo)

Use `playwright-cli` (headless). See AGENTS.md. App runs at `http://localhost:3000`.

### Prerequisites
- Ensure demo seed data is loaded (the app seeds on page load per `seed-demo-data.completed.md`).
- Identify at least two seeded users with a follow relationship. If none exist, create one via the UI (sign up, follow a user).

### Flow 1: Clickable follower/following links on ProfileHeader
1. Navigate to a profile page of a user with followers (e.g. `/profile/{username}`).
2. Verify the page shows "X followers" and "Y following" text.
3. Assert the "followers" text is a clickable link (`<a>` tag) with `href` ending in `/followers`.
4. Assert the "following" text is a clickable link (`<a>` tag) with `href` ending in `/following`.
5. Screenshot: `verify/screenshots/profile-header-links.png`

### Flow 2: Followers page — happy path
1. Click the "X followers" link on the ProfileHeader (or navigate directly to `/profile/{username}/followers`).
2. Assert the page heading contains "@{username}'s Followers".
3. Assert the page shows a "Back" link pointing to `/profile/{username}`.
4. Assert at least one `UserCard` is rendered if the user has followers: card shows username, name, and a Follow/Unfollow button.
5. Screenshot: `verify/screenshots/followers-page-populated.png`

### Flow 3: Following page — happy path
1. Navigate to `/profile/{username}/following` for a user who follows someone.
2. Assert the heading contains "@{username}'s Following".
3. Assert at least one `UserCard` is displayed.
4. Assert the "Back" link exists and points to `/profile/{username}`.
5. Screenshot: `verify/screenshots/following-page-populated.png`

### Flow 4: Follow/Unfollow from the followers/following list
1. Log in as a user (sign up or sign in).
2. Navigate to another user's followers page.
3. Find a `UserCard` for a user that is not yourself.
4. Click the "Follow" button on that card; verify button text changes to "Unfollow".
5. Click "Unfollow"; verify button text changes back to "Follow".
6. Screenshot after each toggle: `verify/screenshots/follow-toggle-from-list.png`

### Flow 5: Empty states
1. Navigate to `/profile/{username}/followers` for a user with **0** followers (create a fresh user if needed).
2. Assert the page shows the empty-state message "No followers yet."
3. Navigate to `/profile/{username}/following` for a user who follows **0** users.
4. Assert the page shows "Not following anyone yet."
5. Screenshot: `verify/screenshots/empty-followers.png`, `verify/screenshots/empty-following.png`

### Flow 6: Non-existent user
1. Navigate to `/profile/nonexistent_user_xyz/followers`.
2. Assert the page shows "User not found".
3. Navigate to `/profile/nonexistent_user_xyz/following`.
4. Assert the page shows "User not found".
5. Screenshot: `verify/screenshots/user-not-found-followers.png`

### Flow 7: Back link navigation
1. From the followers page, click the "← Back" link.
2. Assert the URL changes to `/profile/{username}` (the profile page).
3. Do the same from the following page.

### Flow 8: Loading skeleton (optional / best-effort)
1. Navigate to a followers page and immediately check for skeleton loaders (`.animate-pulse` elements) before data loads.
2. This is timing-dependent so mark pass/fail as informational only.

## Success criteria
- All backend tests pass (`npm run test:run` exit code 0).
- All E2E flows 1–7 pass with assertions verified and screenshots saved.
- Flow 8 is informational.
- Any failures or refactor notes are documented in `verify/verify-report.md` and fed back to the coder.
- When all pass, mark this todo as verified by creating `swarm/todo/followers-following-lists.verified.md`.

## Out of scope
- No new product features.
- No frontend unit tests (no Vitest in `src/`).
- No pagination testing (future enhancement per the todo).

## Last run (verify-report)
- Report: `verify/verify-report.md`
- Todo: `followers-following-lists.completed.md`
- Backend: PASS
- E2E: ProfileHeader links PASS; Followers page PASS; Following page PASS; Follow/Unfollow toggle PASS; Empty states PASS; Non-existent user PASS; Back link navigation PASS; Loading skeleton (info) PASS
- Bugs for coder: None
- Refactor items (if any): `verify/refactor/followers-following-lists.md`
