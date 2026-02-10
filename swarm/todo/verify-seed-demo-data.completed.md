# Verification Plan: Seed Demo Data (from seed-demo-data.completed.md)

## Todo under test
**seed-demo-data.completed.md** — An idempotent seed data system (`convex/seed.ts`) that populates the database with 5 demo users (demo_alice, demo_bob, demo_carol, demo_dan, demo_eve), 12 sample tweets, 10 follow relationships, and 20 likes. Provides both an `internalMutation` (`seedDemoData`) and a public `mutation` (`runSeed`) callable via `npx convex run seed:runSeed`. Checks for existing `demo_alice` user to skip re-seeding.

## Backend tests
- Run: `cd mini-twitter && npm run test:run`
- This run verifies the work from seed-demo-data.completed.md. The seed module itself does not have a dedicated test file, but the full backend suite (`tweets.test.ts`, `social.test.ts`, `likes.test.ts`, `users.test.ts`) should still pass to confirm the seed schema and mutations don't break existing functionality.
- Do not add or run frontend unit tests (no Vitest in `src/`).

## Playwright E2E flows (all features in this todo)

Use playwright-cli (headless). See AGENTS.md for setup.

### Flow 1: Seed populates demo data via CLI
1. Run `npx convex run seed:runSeed` from the command line.
2. Verify the return value indicates `{ status: "seeded", users: 5, tweets: 12, follows: 10, likes: 20 }`.
3. This confirms the public mutation is callable and produces the expected counts.

### Flow 2: Idempotency — running seed twice is a no-op
1. Run `npx convex run seed:runSeed` a second time.
2. Verify the return value is `{ status: "already_seeded" }`.
3. This confirms the seed mutation is idempotent and does not duplicate data.

### Flow 3: Demo users appear in search
1. Open the app in playwright-cli.
2. Navigate to the search page.
3. Search for "demo_alice" — verify Alice Demo appears in results.
4. Search for "demo_bob" — verify Bob Builder appears in results.
5. Search for "demo" — verify multiple demo users appear.

### Flow 4: Demo user profiles show correct data
1. Navigate to `/profile/demo_alice`.
2. Verify the profile shows name "Alice Demo", bio "Tech enthusiast and coffee lover.", and correct tweet count.
3. Navigate to `/profile/demo_bob`.
4. Verify the profile shows name "Bob Builder", bio "Building cool stuff on the internet.", and correct tweet count.

### Flow 5: Demo tweets appear on user profiles
1. On demo_alice's profile, verify her tweets are listed (she has tweets at indices 0, 5, 10 in DEMO_TWEETS — 3 tweets total).
2. On demo_bob's profile, verify his tweets are listed (indices 1, 6, 11 — 3 tweets total).
3. Check that tweet content matches expected text (e.g. "Excited to try this mini Twitter app!" for Alice's first tweet).

### Flow 6: Follow counts are correct
1. On demo_alice's profile, verify follower count = 3 (carol, dan, eve follow her) and following count = 2 (she follows bob, carol).
2. On demo_bob's profile, verify follower count = 2 (alice, dan follow him) and following count = 2 (he follows carol, dan).

### Flow 7: Like counts are displayed on tweets
1. On demo_alice's profile tweets tab, check that her tweets show like counts > 0.
2. For example, tweet "Excited to try this mini Twitter app!" (tweetIndex 0) should have 2 likes (from demo_bob and demo_carol).

### Flow 8: Followers/following lists contain demo users
1. Navigate to `/profile/demo_alice/followers`.
2. Verify the followers list contains demo_carol, demo_dan, and demo_eve.
3. Navigate to `/profile/demo_alice/following`.
4. Verify the following list contains demo_bob and demo_carol.

### Screenshots
Save all screenshots to `verify/screenshots/` with descriptive names (e.g. `seed-search-demo-alice.png`, `seed-profile-demo-alice.png`, etc.).

### Report
Write results to `verify/verify-report.md`.

## Success criteria
- Backend test suite passes with no regressions.
- `npx convex run seed:runSeed` returns expected seeded/already_seeded status.
- All listed E2E flows pass: demo users searchable, profiles correct, tweets present, follow/like counts accurate, idempotency confirmed.
- Failures and refactor notes go to coder. When done, mark this todo as verified.

## Out of scope
- No new product features; no frontend unit tests.

## Last run (verify-report)
- Report: verify/verify-report.md
- Todo: seed-demo-data
- Backend: PASS
- E2E: Flow 1 PASS; Flow 2 PASS; Flow 3 PASS (edge: empty search PASS); Flow 4 PASS (edge: invalid profile PASS); Flow 5 PASS; Flow 6 PASS; Flow 7 PASS; Flow 8 PASS
- Bugs for coder: None
- Refactor items (if any): verify/refactor/seed-demo-data.md

Summary: All checks passed.
