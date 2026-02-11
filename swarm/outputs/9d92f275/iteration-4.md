Iteration 4 (agent a3258022, task ce5bed4f)

Node version
- Before: v18.20.8
- After nvm use 20: v20.19.5

Tests
- npm run test:run (vitest run): PASS (7 files, 46 tests)
- npm run build (next build): PASS
- npm run lint: WARN only (5 warnings, 0 errors)

Playwright E2E
- Not run: tool restriction prevents starting long-lived dev server

Notes
- npm run test --if-present initially started vitest watch; process killed.
