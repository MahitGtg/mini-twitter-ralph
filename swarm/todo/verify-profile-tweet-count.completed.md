# Verification Plan: Profile Tweet Count (from profile-tweet-count.completed.md)
Summary: Verified with backend + E2E pass.

## Todo under test
**profile-tweet-count.completed.md** — Adds a tweet count display to user profile pages. This includes:
1. A new `getUserTweetCount` query in `convex/tweets.ts` that counts tweets by userId using the `by_userId` index.
2. Updated `ProfileHeader` component (`src/components/user/ProfileHeader.tsx`) that calls `getUserTweetCount` and renders the count alongside followers/following stats (e.g. "3 tweets · 5 followers · 2 following").

## Backend tests
- Run: `cd mini-twitter && npm run test:run`
- Primary file: `convex/tweets.test.ts` — covers createTweet, deleteTweet, getFeed, getUserTweets. Verify existing tests still pass. The `getUserTweetCount` query should also be exercised (check if a test exists; if not, the tester notes it but does not add one).
- Secondary files: `convex/social.test.ts`, `convex/likes.test.ts`, `convex/users.test.ts` — run full suite to catch regressions.
- All backend tests must pass.

## Playwright E2E flows (all features in this todo)

Use `playwright-cli` in headless mode per AGENTS.md. The app runs at `http://localhost:3000`.

### Flow 1: Tweet count visible on own profile (happy path)
1. Sign in as a seeded user who has existing tweets.
2. Navigate to that user's profile page (`/profile/{username}`).
3. Assert the stats line contains a number followed by "tweets" (e.g. regex `\d+ tweets`).
4. Screenshot: `verify/screenshots/profile-tweet-count-own.png`.

### Flow 2: Tweet count visible on another user's profile
1. Sign in as user A.
2. Navigate to user B's profile page.
3. Assert tweet count text is present in the stats area.
4. Screenshot: `verify/screenshots/profile-tweet-count-other.png`.

### Flow 3: Tweet count is zero for a user with no tweets
1. Find or create a user who has zero tweets (or verify a newly-registered user).
2. Navigate to their profile.
3. Assert "0 tweets" appears in the stats line.
4. Screenshot: `verify/screenshots/profile-tweet-count-zero.png`.

### Flow 4: Tweet count updates after posting a new tweet
1. Sign in as a user; navigate to own profile; record the current tweet count.
2. Post a new tweet (via the compose form on the home feed or profile).
3. Navigate back to own profile.
4. Assert the tweet count has incremented by 1.
5. Screenshot: `verify/screenshots/profile-tweet-count-after-post.png`.

### Flow 5: Tweet count updates after deleting a tweet
1. Sign in as a user who has at least one tweet; navigate to own profile; record the tweet count.
2. Delete one of the user's tweets.
3. Verify the tweet count decremented by 1.
4. Screenshot: `verify/screenshots/profile-tweet-count-after-delete.png`.

### Flow 6: Stats line layout — tweet count alongside followers/following
1. On any profile page, assert the stats line contains all three metrics: tweets count, followers link, following link — separated by " · ".
2. Assert the followers and following links point to `/profile/{username}/followers` and `/profile/{username}/following`.
3. Screenshot: `verify/screenshots/profile-tweet-count-layout.png`.

## Success criteria
- All backend tests pass (`npm run test:run` exits 0).
- All six Playwright E2E flows pass with screenshots saved.
- Failures and refactor notes go to coder. When done, mark this todo as verified.

## Out of scope
- No new product features; no frontend unit tests.

## Last run (verify-report)
- Report: verify/verify-report.md
- Todo: profile-tweet-count
- Backend: PASS
- E2E: Flow 1 PASS; Flow 2 PASS; Flow 3 PASS; Flow 4 PASS; Flow 5 PASS; Flow 6 PASS; Edge cases PASS
- Bugs for coder: None
- Refactor items (if any): None
