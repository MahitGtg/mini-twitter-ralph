Implemented idempotent seed mutation in `convex/seed.ts`.
- `runSeed` inserts demo users, tweets, follows, and likes if demo users not present.
- Demo data uses 5 users, 12 tweets, 10 follows, 20 likes with staggered timestamps.
Run: `npx convex run seed:runSeed`
