Completed Convex backend setup:
- Added schema and core Convex functions for users, tweets, follows, and likes.
- Added Convex Auth config (password provider) and auth initialization.
- Wired `ConvexAuthProvider` into the Next.js root layout.
- Updated `package.json` scripts for parallel dev and installed auth deps.

Pending manual step: run `npx convex dev` to generate types and deploy schema.
