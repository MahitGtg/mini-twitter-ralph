Iteration 3 (agent 14c837bb)

Node version:
- Started at v18.20.8
- Switched via nvm to v20.19.5

Tests/build/lint:
- npm run test --if-present launched vitest in watch mode; stopped it.
- npm run test:run: pass (46 tests)
- npm run build: pass
- npm run lint: warnings only (unused eslint-disable in convex _generated, next/no-img-element in UserAvatar)

Playwright E2E:
- Not run. Requires starting dev server (long-lived process), which is disallowed by system constraints for this agent session.

Git:
- No changes made by this iteration; repo already has existing modifications.
