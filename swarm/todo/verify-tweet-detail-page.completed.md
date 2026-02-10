# Verification Plan: Tweet Detail Page (from tweet-detail-page.completed.md)
Summary: All backend tests and E2E flows passed.

## Todo under test
**tweet-detail-page** — A dedicated page at `/tweet/[tweetId]` for viewing a single tweet by its permalink. Features include:
- Tweet detail page route (`/tweet/[tweetId]`) with loading skeleton and 404 handling
- TweetCard links (content and timestamp) navigate to the tweet detail permalink
- Backend `getTweetById` query returns author data alongside the tweet
- Back navigation link on the detail page
- Like/unlike and delete functionality work on the detail page
- Author link on the detail page still navigates to the profile page

## Backend tests
- Run: `cd mini-twitter && npm run test:run`
- Relevant test files: `convex/tweets.test.ts` (covers `getTweetById` with author enrichment), plus full suite (`convex/social.test.ts`, `convex/likes.test.ts`, `convex/users.test.ts`) to confirm no regressions.
- Do not add or run frontend unit tests (no Vitest in `src/`).

## Playwright E2E flows (all features in this todo)

### Flow 1 — Navigate to tweet detail via permalink (happy path)
1. Go to the home feed (`/`). Ensure at least one tweet is visible (seed data provides demo tweets).
2. Click on a tweet's **content text** — verify navigation to `/tweet/{tweetId}`.
3. Assert the page contains the "← Back" link and the heading "Tweet".
4. Assert the tweet content, author name, and handle are displayed.
5. Screenshot: `verify/screenshots/tweet-detail-happy.png`

### Flow 2 — Navigate via timestamp link
1. From the feed, click on a tweet's **timestamp** (relative time element).
2. Verify URL matches `/tweet/{tweetId}`.
3. Assert tweet content renders correctly.
4. Screenshot: `verify/screenshots/tweet-detail-via-timestamp.png`

### Flow 3 — 404 / Not-found state for invalid tweet ID
1. Navigate to `/tweet/invalidid12345` (a bogus ID).
2. Assert the page displays "Tweet not found" text and includes the tweet ID in the message.
3. Assert the "← Back" link is present.
4. Screenshot: `verify/screenshots/tweet-detail-not-found.png`

### Flow 4 — Loading skeleton renders
1. Navigate to a valid tweet URL.
2. On initial load, attempt to capture the skeleton state (may be brief); if not visible, note as expected fast-load.
3. Verify final rendered state has tweet content (not stuck on skeleton).

### Flow 5 — Like / unlike on the detail page
1. Sign in as a demo user (e.g., demo_alice).
2. Navigate to a tweet detail page for a tweet by **another** user.
3. Note the current like count.
4. Click "Like" button — assert button text changes to "Liked" and like count increments by 1.
5. Click "Liked" button again — assert it toggles back to "Like" and count decrements.
6. Screenshot after like: `verify/screenshots/tweet-detail-liked.png`
7. Screenshot after unlike: `verify/screenshots/tweet-detail-unliked.png`

### Flow 6 — Delete own tweet on the detail page
1. Sign in as a demo user who has tweets (e.g., demo_alice).
2. Navigate to one of their own tweets' detail page.
3. Assert the "Delete" button is visible (owner-only).
4. Click "Delete" — assert the tweet card disappears (returns `null`).
5. Reload the page at the same URL — assert the 404 "Tweet not found" state renders.
6. Screenshot before delete: `verify/screenshots/tweet-detail-before-delete.png`
7. Screenshot after delete/reload: `verify/screenshots/tweet-detail-after-delete.png`

### Flow 7 — Delete button hidden for non-owner
1. Sign in as a user who did NOT author a particular tweet.
2. Navigate to that tweet's detail page.
3. Assert "Delete" button is **not** present.
4. Assert "Like" button **is** present.
5. Screenshot: `verify/screenshots/tweet-detail-non-owner.png`

### Flow 8 — Author link navigates to profile
1. On a tweet detail page, click the author name/handle link.
2. Verify navigation to `/profile/{username}`.
3. Assert the profile page renders with the correct username.
4. Screenshot: `verify/screenshots/tweet-detail-author-link.png`

### Flow 9 — Back link navigates to home
1. On a tweet detail page, click the "← Back" link.
2. Verify navigation to `/` (home feed).
3. Screenshot: `verify/screenshots/tweet-detail-back-nav.png`

## Success criteria
- Backend test suite passes with zero failures.
- All 9 Playwright E2E flows pass with the expected assertions.
- Screenshots saved to `verify/screenshots/`.
- Report written to `verify/verify-report.md`.
- Failures and refactor notes forwarded to coder. When all pass, mark this todo as verified.

## Out of scope
- No new product features; no frontend unit tests.

## Last run (verify-report)
- Report: verify/verify-report.md
- Todo: tweet-detail-page
- Backend: PASS
- E2E: Flow 1 PASS; Flow 2 PASS; Flow 3 FAIL; Flow 4 PASS; Flow 5 PASS; Flow 6 PASS; Flow 7 PASS; Flow 8 PASS; Flow 9 PASS
- Bugs for coder: Invalid tweet ID crashes with `Application error: a client-side exception has occurred while loading localhost (see the browser console for more information).` Expected not-found state. Suggested fix: guard null/invalid results in `src/app/tweet/[tweetId]/page.tsx` (or tweet detail loader) and render the not-found state without throwing.
- Refactor items (if any): verify/refactor/tweet-detail-page.md

## Fixes applied (iteration 9)
- Bug fix: updated `mini-twitter/src/app/tweet/[tweetId]/page.tsx` to validate tweet ID format before querying Convex and render the existing not-found state for invalid IDs instead of issuing a failing query.
- UI refactor: updated tweet detail back link to button-like styling with border/hover affordance in both normal and not-found states.
- UI refactor: added clearer vertical spacing between the "Tweet" heading and tweet card for improved scanability.
- UI refactor: tightened compact `UserCard` alignment (`mini-twitter/src/components/user/UserCard.tsx`) by using top-aligned compact layout, smaller avatar size, and adjusted spacing.
- Refactor task file completed: renamed `verify/refactor/tweet-detail-page.md` to `verify/refactor/tweet-detail-page.done.md`.
- Partial rerun confirmed Flow 3 now renders "Tweet not found" for invalid IDs.

## Re-verification guidance (iteration 10)
All bugs and refactor items from the previous run have been addressed. This run should:

1. **Backend**: Run `cd mini-twitter && npm run test:run` — confirm full suite still passes (regression check after fixes).
2. **Playwright E2E — full re-run of all 9 flows**:
   - **Flow 3 is the priority** — previously failed. Navigate to `/tweet/invalidid12345` and assert "Tweet not found" text renders (not a client-side error). Also try other invalid patterns like `/tweet/abc`, `/tweet/000` to confirm robustness.
   - Re-run Flows 1–2, 4–9 as regression checks. The UI refactors (back link styling, spacing, UserCard alignment) should be visually confirmed via screenshots.
   - Take fresh screenshots for all flows, overwriting the previous ones in `verify/screenshots/`.
3. **If all 9 flows pass**: update `verify/verify-report.md` with all PASS, then mark `tweet-detail-page` as verified.
4. **If any flow fails**: document in verify-report and do NOT mark as verified.

## Last run (verify-report)
- Report: verify/verify-report.md
- Todo: tweet-detail-page
- Backend: PASS
- E2E: Flow 1 PASS; Flow 2 PASS; Flow 3 PASS (invalidid12345/abc/000); Flow 4 PASS (skeleton not observed); Flow 5 PASS; Flow 6 PASS; Flow 7 PASS; Flow 8 PASS; Flow 9 PASS
- Bugs for coder: None
- Refactor items (if any): None
