Implemented Vitest setup and added Convex + component tests.

Changes:
- Added `vitest.config.ts` and `src/test/setup.ts`.
- Added Convex tests: `convex/tweets.test.ts`, `convex/likes.test.ts`, `convex/social.test.ts`, `convex/users.test.ts`, and `convex/testSetup.ts`.
- Added component tests: `TweetComposer`, `UserCard`, `SignInForm`, `SignUpForm`.
- Fixed `UserCard.tsx` escaping issue.
- Added test scripts + dev deps; `npm run test:run` passes.

Remaining:
- E2E tests (playwright-cli), coverage check (>60%), optional CI workflow.

Checker notes:
- Fixed invalid YAML in `swarm/swarm.yaml` (removed stray nested `tester:` key).
