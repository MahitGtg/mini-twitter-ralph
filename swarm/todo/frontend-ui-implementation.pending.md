# Feature: Frontend UI Implementation

## Priority: CRITICAL (backend exists but no UI to use it)

## Problem
The Convex backend is fully set up with authentication, tweets, social features, and likes APIs. However, the frontend is still the default Next.js starter template showing "To get started, edit the page.tsx file." Users cannot interact with the application at all - there's no way to sign up, log in, post tweets, or see a feed.

## Goal
Build a complete, functional frontend UI that connects to the existing Convex backend APIs and provides a Twitter-like user experience.

## Dependencies
- Convex backend setup (completed)
- ConvexClientProvider already wired in layout.tsx

## Tasks

### 1. Create Authentication Components (`mini-twitter/src/components/auth/`)

#### SignInForm.tsx
- Email and password inputs
- Submit button
- Link to sign up
- Uses `useAuthActions` from `@convex-dev/auth/react`
- Call `signIn("password", { email, password, flow: "signIn" })`

#### SignUpForm.tsx
- Email, password, and confirm password inputs
- Username input (required for new users)
- Submit button
- Link to sign in
- Uses `useAuthActions` with `flow: "signUp"`

#### AuthButton.tsx
- Shows "Sign In" when logged out
- Shows username + "Sign Out" when logged in
- Uses `useConvexAuth()` for auth state
- Uses `useQuery(api.users.getCurrentUser)` for user info

### 2. Create Tweet Components (`mini-twitter/src/components/tweets/`)

#### TweetComposer.tsx
- Textarea with 300 character limit
- Character counter showing remaining chars
- Submit button (disabled when empty or over limit)
- Uses `useMutation(api.tweets.createTweet)`
- Show loading state while submitting

#### TweetCard.tsx
- Display tweet content
- Show author username, avatar (or placeholder)
- Show relative timestamp (e.g., "2h ago")
- Like button with count
- Delete button (only for own tweets)
- Uses `useMutation(api.tweets.deleteTweet)`
- Uses `useMutation(api.likes.likeTweet)` and `unlikeTweet`
- Uses `useQuery(api.likes.hasLiked)` and `getTweetLikes`

#### TweetFeed.tsx
- List of TweetCard components
- Uses `useQuery(api.tweets.getFeed)` for home feed
- Or `useQuery(api.tweets.getUserTweets)` for profile
- Empty state when no tweets
- Loading skeleton while fetching

### 3. Create User Components (`mini-twitter/src/components/user/`)

#### UserAvatar.tsx
- Display user avatar image or fallback initials
- Different sizes (sm, md, lg)
- Clickable to go to profile

#### UserCard.tsx
- Avatar, username, bio preview
- Follow/unfollow button
- Follower/following counts
- Uses `useQuery(api.social.isFollowing)`
- Uses `useMutation(api.social.follow)` and `unfollow`

#### ProfileHeader.tsx
- Large avatar, username, bio
- Edit profile button (for own profile)
- Follow/unfollow button (for others)
- Follower/following counts
- Uses `useQuery(api.social.getFollowers)` and `getFollowing`

### 4. Create Layout Components (`mini-twitter/src/components/layout/`)

#### Sidebar.tsx
- Navigation links: Home, Profile
- Tweet button (opens composer modal or scrolls to composer)
- User info at bottom when logged in

#### MainLayout.tsx
- Three-column layout (sidebar, main content, right sidebar)
- Responsive: collapse to single column on mobile
- Uses Tailwind CSS for styling

### 5. Create Pages

#### Home Page (`mini-twitter/src/app/page.tsx`)
- Replace default Next.js content
- Show TweetComposer at top (when logged in)
- Show TweetFeed below
- Show sign-in prompt when logged out

#### Profile Page (`mini-twitter/src/app/profile/[username]/page.tsx`)
- Dynamic route for username
- ProfileHeader component
- User's tweets feed
- Uses `useQuery(api.users.getUserByUsername)`

#### Auth Pages (`mini-twitter/src/app/auth/signin/page.tsx` and `signup/page.tsx`)
- Clean centered forms
- Redirect to home after successful auth

### 6. Add Utility Hooks (`mini-twitter/src/hooks/`)

#### useRelativeTime.ts
- Convert timestamps to "2m ago", "1h ago", "3d ago" format

#### useDebounce.ts
- Debounce hook for search/input optimization

### 7. Add Global Styles and Theming
- Update `globals.css` with Twitter-like color scheme
- Primary blue (#1DA1F2)
- Dark mode support (already in Tailwind config)
- Consistent spacing and typography

## UI Design Guidelines
- Clean, minimal Twitter-inspired design
- Card-based tweet display with subtle borders
- Rounded buttons and inputs
- Hover states for interactive elements
- Loading skeletons for async data
- Toast notifications for actions (tweet posted, followed user, etc.)

## Acceptance Criteria
- [ ] Users can sign up with email/password and username
- [ ] Users can sign in and sign out
- [ ] Logged-in users can compose and post tweets
- [ ] Home feed shows tweets from followed users + own tweets
- [ ] Users can like/unlike tweets
- [ ] Users can delete their own tweets
- [ ] Users can view any user's profile by username
- [ ] Users can follow/unfollow other users
- [ ] UI is responsive (works on mobile and desktop)
- [ ] All actions show appropriate loading/success states

## Notes
- Use `"use client"` directive for all interactive components
- Prefer Convex hooks (`useQuery`, `useMutation`) over manual fetching
- Handle loading and error states gracefully
- Keep components small and focused
- Consider adding react-hot-toast for notifications
