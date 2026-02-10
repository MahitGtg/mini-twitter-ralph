Iteration 6 (agent 1d58354d)

Actions:
- Switched Node to v20.19.5 via nvm.
- Ran `CI=1 npm test` (vitest) successfully.
- Ran `npm run build` successfully after fixing optional user id query args.
- Ran `npm run lint` (warnings only).

Fixes:
- Guarded `TweetFeed` queries to avoid passing undefined `userId` values.
