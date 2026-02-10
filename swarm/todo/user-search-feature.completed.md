# Feature: User Search & Discovery

## Priority: HIGH (Critical for social features to be usable)

## Problem
The Mini Twitter app has follow/unfollow functionality implemented, but **there's no way to discover or search for users**. Users can only find other profiles by:
1. Knowing the exact username and typing `/profile/{username}` in the URL
2. Seeing someone's tweet in their feed (which requires already following them)

This creates a "cold start" problem - new users see an empty feed with no way to find people to follow.

## Goal
Add user search functionality so users can discover and follow other users.

## Dependencies
- Convex backend (completed) - users table exists with `by_username` index
- ProfileHeader component (exists) - for follow/unfollow buttons
- UserAvatar, UserCard components (exist)

## Tasks

### 1. Add User Search Query (`mini-twitter/convex/users.ts`)

Add a search query that finds users by partial username match:

```typescript
export const searchUsers = query({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query, limit }) => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) {
      return [];
    }
    
    // Fetch users and filter by username prefix match
    // Note: Convex doesn't support LIKE queries, so we do a prefix search
    const allUsers = await ctx.db.query("users").collect();
    const matches = allUsers
      .filter((user) => 
        user.username.toLowerCase().startsWith(searchTerm) ||
        (user.name && user.name.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit ?? 10);
    
    return matches;
  },
});
```

### 2. Add "Who to Follow" Suggestions Query (`mini-twitter/convex/users.ts`)

Add a query that returns users the current user doesn't follow:

```typescript
export const getSuggestedUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // For unauthenticated users, return some recent users
      return ctx.db
        .query("users")
        .order("desc")
        .take(limit ?? 5);
    }
    
    // Get users the current user already follows
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", userId))
      .collect();
    const followingIds = new Set(follows.map((f) => f.followingId));
    followingIds.add(userId); // Exclude self
    
    // Get users not being followed
    const allUsers = await ctx.db.query("users").collect();
    const suggestions = allUsers
      .filter((user) => !followingIds.has(user._id))
      .slice(0, limit ?? 5);
    
    return suggestions;
  },
});
```

### 3. Create Search Page Route (`mini-twitter/src/app/search/page.tsx`)

Create a search page with a search input and results:

```typescript
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import UserCard from "@/components/user/UserCard";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  
  const searchResults = useQuery(
    api.users.searchUsers,
    debouncedSearch ? { query: debouncedSearch } : "skip"
  );
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">Search Users</h1>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        
        {debouncedSearch && searchResults !== undefined && (
          <section>
            <h2 className="mb-4 text-sm font-medium text-slate-500">
              {searchResults.length === 0
                ? "No users found"
                : `${searchResults.length} user${searchResults.length === 1 ? "" : "s"} found`}
            </h2>
            <div className="space-y-3">
              {searchResults.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  currentUserId={currentUser?._id}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
```

### 4. Create "Who to Follow" Component (`mini-twitter/src/components/user/WhoToFollow.tsx`)

Create a sidebar component showing suggested users:

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UserCard from "./UserCard";

export default function WhoToFollow() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const suggestions = useQuery(api.users.getSuggestedUsers, { limit: 3 });

  if (suggestions === undefined) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-12 rounded bg-slate-100" />
          <div className="h-12 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Who to follow</h3>
      <div className="space-y-3">
        {suggestions.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            currentUserId={currentUser?._id}
            compact
          />
        ))}
      </div>
    </div>
  );
}
```

### 5. Update Sidebar with Search Link (`mini-twitter/src/components/layout/Sidebar.tsx`)

Add a Search link to the navigation:

```typescript
// In the nav section, add:
<Link
  href="/search"
  className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
>
  Search
</Link>
```

### 6. Update UserCard Component (if needed)

Ensure `UserCard.tsx` can display user info with follow/unfollow button. Check if it needs a `compact` prop variant:

```typescript
interface UserCardProps {
  user: Doc<"users">;
  currentUserId?: Id<"users">;
  compact?: boolean;
}
```

## UI Design

Search Page:
- Full-width search input with placeholder text
- Results appear below as user cards
- Each card shows avatar, name, username, and follow button

Who to Follow Widget:
- Compact card design for sidebar
- Shows 3 suggested users
- "Follow" button on each card
- Disappears when no suggestions

## Acceptance Criteria
- [ ] Users can search for other users by username
- [ ] Search results appear as user cards with follow buttons
- [ ] "Who to Follow" suggestions appear for logged-in users
- [ ] Suggestions exclude users already being followed
- [ ] Search link is accessible from sidebar navigation
- [ ] Empty states display appropriate messages
- [ ] Loading states show skeleton UI

## Notes
- Search uses prefix matching on username since Convex doesn't support LIKE queries
- Consider adding a search index in the future for better performance
- The `useDebounce` hook already exists in the codebase
- UserCard component exists and should be reusable

## Performance Considerations
- The current implementation fetches all users and filters in memory
- For production scale, would need Convex search indexes
- Limit results to prevent large payloads

## Completion Notes
- Added `searchUsers` and `getSuggestedUsers` Convex queries.
- Created search page with debounce, loading, and empty states.
- Added `WhoToFollow` sidebar widget and integrated into home/search.
- Updated `UserCard` for compact rendering and self-follow guard.
- Added Search link to the sidebar.
