# Verification Plan: Profile Likes Tab (from profile-likes-tab.completed.md)

## Todo under test
**profile-likes-tab.completed.md** — Adds a "Likes" tab to user profile pages. Features:
1. Backend `getLikedTweets` query in `convex/likes.ts` that returns liked tweets with author info, ordered newest-first, filtering deleted tweets.
2. Profile page (`/profile/[username]`) has "Tweets" and "Likes" tab buttons; active tab controls which feed is shown.
3. `TweetFeed` component accepts optional `likedByUserId` prop and queries `api.likes.getLikedTweets` when provided.
4. Empty state displays "No liked tweets yet." when the likes tab has no content.
5. Backend tests in `convex/likes.test.ts` covering the new `getLikedTweets` query.

## Backend tests
- **Run**: `cd mini-twitter && npm run test:run`
- **Relevant test file**: `convex/likes.test.ts`
  - "returns empty list when user has no likes"
  - "returns liked tweets in reverse chronological order"
  - "includes author data with liked tweets"
  - "filters out liked tweets that were deleted"
  - Plus existing like/unlike/count/hasLiked tests
- Run the full test suite (all `convex/*.test.ts`) to ensure no regressions.

## Playwright E2E flows (all features in this todo)

Use `playwright-cli` in headless mode per AGENTS.md. App runs at `http://localhost:3000`.

### Flow 1: Tabs render on profile page
1. Sign in (or use a seeded user).
2. Navigate to a user profile page (e.g. `/profile/<username>`).
3. Assert that both "Tweets" and "Likes" tab buttons are visible.
4. Assert that the "Tweets" tab is active by default (has `aria-pressed="true"` or the active styling class `border-sky-500`).
5. Screenshot: `verify/screenshots/profile-likes-tab-tabs-render.png`

### Flow 2: Switch to Likes tab — happy path with liked tweets
1. Sign in as a user who has liked at least one tweet (seed data or like a tweet first).
2. Navigate to that user's profile page.
3. Click the "Likes" tab button.
4. Assert the "Likes" tab becomes active (border-sky-500 style, aria-pressed="true").
5. Assert that liked tweet cards appear, each showing the **original author** (not the liker).
6. Screenshot: `verify/screenshots/profile-likes-tab-liked-tweets.png`

### Flow 3: Likes tab — empty state
1. Sign in as a user (or create/use one) who has **not** liked any tweets.
2. Navigate to that user's profile.
3. Click the "Likes" tab.
4. Assert the empty state message "No liked tweets yet." is displayed.
5. Screenshot: `verify/screenshots/profile-likes-tab-empty-likes.png`

### Flow 4: Tab switching preserves state
1. On a profile with both tweets and liked tweets:
   - Start on "Tweets" tab — verify tweet cards are visible.
   - Switch to "Likes" tab — verify liked tweets appear.
   - Switch back to "Tweets" tab — verify original tweets reappear.
2. Screenshot after each switch: `verify/screenshots/profile-likes-tab-switch-back.png`

### Flow 5: Like a tweet then verify it appears in Likes tab
1. Sign in as a user.
2. Navigate to the home feed or another user's profile.
3. Like a tweet (click the heart/like button).
4. Navigate to the current user's own profile.
5. Click the "Likes" tab.
6. Assert the just-liked tweet appears in the list.
7. Screenshot: `verify/screenshots/profile-likes-tab-new-like.png`

### Flow 6: Unlike a tweet then verify it disappears from Likes tab
1. Starting from Flow 5's state (tweet is liked and visible in Likes tab).
2. Unlike that tweet (navigate to it and click unlike, or unlike from within the Likes tab if possible).
3. Verify the tweet is no longer shown in the Likes tab (or page refreshes to reflect removal).
4. Screenshot: `verify/screenshots/profile-likes-tab-unlike-removed.png`

## Success criteria
- All backend tests pass (`npm run test:run` exits 0, all `likes.test.ts` cases green).
- All 6 Playwright E2E flows pass with correct assertions.
- Screenshots saved to `verify/screenshots/`.
- Report written to `verify/verify-report.md`.
- Failures and refactor notes go to coder. When all pass, mark this todo as verified.

## Out of scope
- No new product features.
- No frontend unit tests (no Vitest in `src/`).

## Last run (verify-report)
- Report: `verify/verify-report.md`
- Todo: profile-likes-tab
- Backend: PASS
- E2E: Flow 1 PASS; Flow 2 PASS; Flow 3 PASS; Flow 4 PASS; Flow 5 PASS; Flow 6 PASS
- Bugs for coder: None found in this run.
- Refactor items (if any): `verify/refactor/profile-likes-tab.md`

Summary: Backend and E2E checks passed for profile likes tab.
