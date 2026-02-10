Node: v20.19.5 (via nvm use 20).

Tests:
- npm test -- --run (vitest): pass (38 tests).
- npm run build: pass.
- npm run lint: pass with warnings (no errors).

Fixes:
- Escaped apostrophe in profile not-found message to satisfy react/no-unescaped-entities.

Git:
- Commit: 3dc38b2 "Add profile route and link tweet authors".
- Pushed to `cursor-agent`.
