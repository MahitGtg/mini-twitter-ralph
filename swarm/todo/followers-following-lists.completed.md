# Feature: Followers/Following Lists

## Priority: HIGH (Core social feature enhancement)

## Problem
The user profile shows "X followers · Y following" as plain text, but users **cannot click to view the actual list** of who follows them or who they follow. This is a standard Twitter feature that:

1. Enables social discovery - users can explore others' networks
2. Helps verify follows - users can confirm mutual connections
3. Provides navigation - users can click through to discover new profiles

Currently, the backend has `getFollowers` and `getFollowing` queries in `social.ts`, but they only return follow relationship records (not full user data), and there's no UI to display these lists.

## Goal
Add clickable followers/following counts that open a list view showing the users, with follow/unfollow capability.

## Dependencies
- Existing `follows` table with indexes (completed)
- Existing `getFollowers` and `getFollowing` queries (partially completed - need user data)
- Existing `UserCard` component for displaying users
- Existing `ProfileHeader` component (needs modification)

## Tasks

### 1. Update Social Queries to Return User Data (`mini-twitter/convex/social.ts`)

Modify `getFollowers` and `getFollowing` to return full user objects, not just follow records:

```typescript
export const getFollowersWithUsers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", userId))
      .order("desc")
      .collect();
    
    const followers = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        return user ? { ...user, followedAt: follow.createdAt } : null;
      })
    );
    
    return followers.filter(Boolean);
  },
});

export const getFollowingWithUsers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", userId))
      .order("desc")
      .collect();
    
    const following = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        return user ? { ...user, followedAt: follow.createdAt } : null;
      })
    );
    
    return following.filter(Boolean);
  },
});
```

### 2. Create Followers/Following List Page Routes

**File**: `mini-twitter/src/app/profile/[username]/followers/page.tsx`

```typescript
"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import UserCard from "@/components/user/UserCard";

export default function FollowersPage() {
  const params = useParams<{ username?: string | string[] }>();
  const rawUsername = params?.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  const profileUser = useQuery(
    api.users.getUserByUsername,
    username ? { username } : "skip"
  );
  const currentUser = useQuery(api.users.getCurrentUser);
  const followers = useQuery(
    api.social.getFollowersWithUsers,
    profileUser?._id ? { userId: profileUser._id } : "skip"
  );

  if (!username || profileUser === null) {
    return (
      <MainLayout>
        <div className="text-center text-slate-500">User not found</div>
      </MainLayout>
    );
  }

  if (profileUser === undefined || followers === undefined) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/profile/${username}`}
            className="text-slate-500 hover:text-slate-700"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">
            @{username}'s Followers
          </h1>
        </div>

        {followers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No followers yet.
          </div>
        ) : (
          <div className="space-y-3">
            {followers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                currentUserId={currentUser?._id}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
```

**File**: `mini-twitter/src/app/profile/[username]/following/page.tsx`

Similar structure but for the following list, using `getFollowingWithUsers` query.

### 3. Update ProfileHeader with Clickable Links (`mini-twitter/src/components/user/ProfileHeader.tsx`)

Update the follower/following counts to be clickable:

```typescript
// Replace static text with links:
<p className="mt-2 text-xs text-slate-500">
  <Link
    href={`/profile/${user.username}/followers`}
    className="hover:underline"
  >
    {followerCount} followers
  </Link>
  {" · "}
  <Link
    href={`/profile/${user.username}/following`}
    className="hover:underline"
  >
    {followingCount} following
  </Link>
</p>
```

### 4. Add Tests for New Queries

**File**: `mini-twitter/convex/social.test.ts`

Add test cases for:
- `getFollowersWithUsers` returns full user objects
- `getFollowingWithUsers` returns full user objects  
- Empty lists handled correctly
- Deleted users filtered out

## UI Design

Followers/Following Pages:
- Back link to return to profile
- Header showing "@username's Followers" or "@username's Following"
- List of UserCards with follow/unfollow buttons
- Empty state message when no followers/following

ProfileHeader Update:
- Make "X followers" and "Y following" clickable links
- Add hover:underline style for discoverability

## Acceptance Criteria
- [ ] Clicking "X followers" navigates to `/profile/{username}/followers`
- [ ] Clicking "Y following" navigates to `/profile/{username}/following`
- [ ] Followers page shows list of users who follow the profile user
- [ ] Following page shows list of users the profile user follows
- [ ] Each user card has a follow/unfollow button (except for self)
- [ ] Empty states display appropriate messages
- [ ] Loading states show skeleton UI
- [ ] Back link returns to profile page
- [ ] Works for both authenticated and unauthenticated visitors

## Notes
- Reuse existing `UserCard` component for displaying users
- Backend queries should return user data, not just follow records
- Consider adding pagination for users with many followers (future enhancement)
- Leverage existing follow/unfollow mutations from UserCard

## Performance Considerations
- Current implementation loads all followers/following at once
- For production scale, would need pagination with cursor-based loading
- Consider caching follower counts separately from the list

## Completion Notes
- Added followers/following list routes with loading/empty states and UserCard rendering.
- Added new social queries returning user data and tests for them.
- Made profile follower/following counts clickable links.
