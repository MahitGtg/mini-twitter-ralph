# Feature: Seed Demo Data System

## Summary
Add an idempotent seed data system that populates the database with demo users and tweets for testing and development purposes. This follows the AGENTS.md guidance on keeping data seeding simple and idempotent.

## Why This Is Needed
- Agents testing the application need sample data to verify functionality
- New developers can quickly see the app working with realistic data
- Makes manual QA testing much faster
- Currently, the only way to test is to manually create accounts and post tweets

## Implementation Plan

### 1. Create Convex Seed Mutations (`convex/seed.ts`)

Create idempotent mutations that:
- Check if seed data already exists before inserting
- Create 3-5 demo users with realistic usernames, bios, and avatars
- Create 10-15 sample tweets spread across demo users
- Create follow relationships between demo users
- Create some likes on tweets

```typescript
// convex/seed.ts
import { internalMutation } from "./_generated/server";

// Idempotent seed that creates demo users
export const seedDemoUsers = internalMutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existingDemoUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", "demo_alice"))
      .first();
    
    if (existingDemoUser) {
      return { status: "already_seeded" };
    }
    
    // Create demo users
    const demoUsers = [
      { username: "demo_alice", name: "Alice Demo", bio: "Tech enthusiast and coffee lover" },
      { username: "demo_bob", name: "Bob Demo", bio: "Building cool stuff" },
      { username: "demo_carol", name: "Carol Demo", bio: "Designer & maker" },
    ];
    
    // Insert users and return IDs for tweet seeding
    // ...
  },
});

export const seedDemoTweets = internalMutation({
  // Creates sample tweets if demo users exist
});

export const seedDemoInteractions = internalMutation({
  // Creates follows and likes between demo users
});
```

### 2. Add Public Seed Endpoint

Create a public mutation that agents/developers can call from the command line:

```bash
npx convex run seed:runSeed
```

### 3. Add Development Seed Button (Optional)

Add a small "Seed Demo Data" button visible only in development mode:
- Place in the sidebar or a development tools panel
- Clicking calls the seed mutation
- Shows success/error state

## Demo Data Specification

### Users (3-5)
| Username | Name | Bio | Avatar |
|----------|------|-----|--------|
| demo_alice | Alice Demo | Tech enthusiast and coffee lover ☕ | Gradient avatar |
| demo_bob | Bob Builder | Building cool stuff on the internet | Gradient avatar |
| demo_carol | Carol Creative | Designer, maker, dreamer | Gradient avatar |
| demo_dan | Dan Developer | Code all day, debug all night | Gradient avatar |
| demo_eve | Eve Explorer | Always curious, always learning | Gradient avatar |

### Tweets (10-15)
- Mix of short and longer tweets (up to 300 chars)
- Varied timestamps (spread across last 7 days)
- Realistic content: thoughts, updates, tech commentary

### Interactions
- Each demo user follows 2-3 other demo users
- Random likes scattered across tweets (20-30 total likes)

## Success Criteria
- [ ] Running `npx convex run seed:runSeed` populates database with demo data
- [ ] Running seed multiple times has no effect (idempotent)
- [ ] Demo users appear in search
- [ ] Demo tweets appear in feeds when following demo users
- [ ] Like counts and follow counts work correctly

## Files to Create/Modify
- Create: `convex/seed.ts` - Seed mutations
- Modify: `convex/_generated/api.ts` - Auto-generated
- Optional: `src/components/layout/Sidebar.tsx` - Dev seed button

## Notes
- Added `convex/seed.ts` with an idempotent `runSeed` mutation that inserts demo users, tweets, follows, and likes when no demo users exist.
- Seed data uses demo usernames, bios, and sample tweets spread across recent timestamps.
