# Mini Twitter - MVP (50% Scope)

## Tech Stack
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: Convex + TypeScript (use nvm 20+ always)
- **Database**: PostgreSQL (via Convex)
- **Auth**: Convex auth
- **Deployment**: Vercel

## Core Features

### 1. User Authentication
- [x] Sign up with email/password
- [x] Login/Logout
- [x] Basic profile (username, bio, avatar)

### 2. Tweet Functionality
- [x] Create tweet (300 char limit)
- [x] View tweet feed (reverse chronological)
- [x] Delete own tweets
- [ ] Edit tweets (skip for MVP)

### 3. Social Features
- [x] Follow/unfollow users
- [x] Like tweets
- [ ] Retweets (skip for MVP)
- [ ] Comments (skip for MVP)

### 4. Feed
- [x] Home feed (tweets from followed users)
- [x] User profile page (show user's tweets)
- [ ] Explore page (skip for MVP)

### 5. Tweet detail & actions
- [x] Tweet detail page (view single tweet by ID, shareable link)
- [ ] Delete own tweets from detail page (if not already)
- [ ] Character count / live validation in tweet composer

### 6. Discovery & search
- [x] User search (find users by username/name)
- [ ] Basic search results page (optional: search tweets by text)

### 7. Polish & robustness
- [ ] Loading states (skeletons or spinners) for feed, profile, search
- [ ] Clear error states and retry for failed mutations/queries
- [ ] Responsive layout verified on small viewport

## What We're NOT Building (50% cut)
❌ Direct messages
❌ Notifications system
❌ Media uploads (images/videos)
❌ Hashtags
❌ Trending topics
❌ Lists
❌ Bookmarks
❌ Advanced search
❌ Analytics

## Completion Criteria
- All core features implemented
- Basic responsive UI
- Can create account, post tweets, follow users, see feed
- Tests passing (>60% coverage)
- Deployed and accessible via URL