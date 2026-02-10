Iteration 8 summary:
- Node version: v20.19.5 after nvm use 20.
- Tests: npm run test:run passed (46 tests).
- Lint: npm run lint passed with warnings only (unused eslint-disable in convex/_generated; next/no-img-element; react-hooks/exhaustive-deps in ToastContext).
- Build: npm run build passed.
- Fixes: wrapped auth/tweet component tests with ToastProvider; adjusted TweetComposer test to allow multiple "Tweet posted!" nodes.
- Playwright E2E: NOT run here because dev server requires long-lived/background process, which is disallowed by the tool constraints in this environment.
