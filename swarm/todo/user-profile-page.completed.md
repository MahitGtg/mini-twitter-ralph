# Feature: User Profile Page Route

## Priority: CRITICAL (Feature marked complete but route doesn't exist)

## Problem
The PLAN.md marks "User profile page (show user's tweets)" as [x] complete, but **the actual Next.js route does not exist**. The codebase has:

1. **Sidebar.tsx** - Links to `/profile/${user.username}` (line 28-30)
2. **ProfileHeader.tsx** - A fully built profile header component with:
   - User avatar, name, username, bio
   - Follower/following counts
   - Follow/unfollow button for other users
   - Edit profile functionality for own profile
3. **TweetCard.tsx** - Links to user profiles when clicking avatars/usernames
4. **users.ts** - Has `getUserByUsername` query ready to use

But there is **NO `/profile/[username]/page.tsx`** route in the app directory. Clicking any profile link results in a 404 error.

## Goal
Create the dynamic user profile page route at `/profile/[username]` that:
1. Shows the user's profile header (using existing ProfileHeader component)
2. Shows the user's tweets (using existing TweetFeed component)
3. Handles 404 for non-existent users
4. Works for both logged-in and logged-out visitors

## Dependencies
- ProfileHeader component (exists at `src/components/user/ProfileHeader.tsx`)
- TweetFeed component (exists at `src/components/tweets/TweetFeed.tsx`)
- `getUserByUsername` query (exists in `convex/users.ts`)
- MainLayout component (exists at `src/components/layout/MainLayout.tsx`)

## Tasks

### 1. Create Profile Page Route (`mini-twitter/src/app/profile/[username]/page.tsx`)

```typescript
"use client";

import { useQuery } from "convex/react";
import { useParams, notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import ProfileHeader from "@/components/user/ProfileHeader";
import TweetFeed from "@/components/tweets/TweetFeed";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";

function ProfileSkeleton() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Profile header skeleton */}
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-200" />
            <div className="space-y-3">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 w-48 rounded bg-slate-200" />
            </div>
          </div>
        </div>
        {/* Tweets skeleton */}
        <div className="space-y-4">
          <TweetSkeleton />
          <TweetSkeleton />
        </div>
      </div>
    </MainLayout>
  );
}

function NotFoundState({ username }: { username: string }) {
  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900">User not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The user @{username} doesn't exist or may have been deleted.
        </p>
      </div>
    </MainLayout>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const profileUser = useQuery(api.users.getUserByUsername, { username });
  const currentUser = useQuery(api.users.getCurrentUser);

  // Loading state - queries return undefined while loading
  if (profileUser === undefined) {
    return <ProfileSkeleton />;
  }

  // User not found
  if (profileUser === null) {
    return <NotFoundState username={username} />;
  }

  const isCurrentUser = currentUser?._id === profileUser._id;

  return (
    <MainLayout>
      <div className="space-y-6">
        <ProfileHeader user={profileUser} isCurrentUser={isCurrentUser} />
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Tweets</h2>
          <TweetFeed userId={profileUser._id} currentUserId={currentUser?._id} />
        </section>
      </div>
    </MainLayout>
  );
}
```

### 2. Add Page Metadata (Optional but recommended)

Create `mini-twitter/src/app/profile/[username]/layout.tsx` for metadata:

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Mini Twitter",
  description: "View user profile and tweets",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

### 3. Update TweetCard to Link to Profiles

Verify that clicking on a user's avatar or username in a TweetCard navigates to their profile. Check `TweetCard.tsx` and update if needed to include `Link` components:

```typescript
// In TweetCard.tsx - ensure avatar and username are clickable
import Link from "next/link";

// Wrap avatar and username with Link
<Link href={`/profile/${author.username}`}>
  <UserAvatar ... />
</Link>
<Link href={`/profile/${author.username}`} className="hover:underline">
  @{author.username}
</Link>
```

### 4. Verify TweetFeed Handles userId Prop

Ensure `TweetFeed.tsx` correctly uses the `userId` prop to fetch user-specific tweets via `api.tweets.getUserTweets`. The component should already support this based on the completed tweet-display-components feature.

## Acceptance Criteria
- [ ] Navigating to `/profile/{username}` shows the user's profile page
- [ ] Profile page shows ProfileHeader with user info
- [ ] Profile page shows the user's tweets below the header
- [ ] Loading skeleton displays while data loads
- [ ] 404-style message displays for non-existent users
- [ ] Follow/unfollow button works for other users' profiles
- [ ] Edit profile works on own profile page
- [ ] Clicking user avatar/username in tweets navigates to profile
- [ ] Page works for both authenticated and unauthenticated visitors

## Notes
- All components are already built - this is primarily routing/wiring work
- The ProfileHeader already handles edit profile and follow/unfollow functionality
- TweetFeed already supports filtering by userId
- Test navigation from sidebar, TweetCard, and direct URL access

## Completion Notes
- Added `/profile/[username]` route with skeleton and not-found states.
- Added profile layout metadata for the route.
- Linked TweetCard avatars and names to profile pages.
