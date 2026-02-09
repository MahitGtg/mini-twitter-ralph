# Mini Twitter Product Requirements Document

## User Stories

### Authentication
1. As a user, I want to sign up with email/password
2. As a user, I want to login to access my account
3. As a user, I want to edit my profile (username, bio, avatar)

### Tweeting
4. As a user, I want to compose and post tweets (max 280 chars)
5. As a user, I want to see a feed of tweets from people I follow
6. As a user, I want to delete my own tweets

### Social Interaction
7. As a user, I want to follow other users
8. As a user, I want to unfollow users
9. As a user, I want to like tweets
10. As a user, I want to see a user's profile and their tweets

## Technical Requirements

### Database Schema
```typescript
User {
  id: string
  username: string
  email: string
  bio: string
  avatarUrl: string
  createdAt: timestamp
}

Tweet {
  id: string
  userId: string
  content: string
  likes: number
  createdAt: timestamp
}

Follow {
  followerId: string
  followingId: string
  createdAt: timestamp
}

Like {
  userId: string
  tweetId: string
  createdAt: timestamp
}
```

### API Endpoints
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/users/:id
- PUT /api/users/:id
- POST /api/tweets
- GET /api/tweets/feed
- GET /api/tweets/user/:userId
- DELETE /api/tweets/:id
- POST /api/follow/:userId
- DELETE /api/follow/:userId
- POST /api/tweets/:id/like
- DELETE /api/tweets/:id/like

### Frontend Routes
- /login
- /signup
- /home (feed)
- /profile/:username
- /compose

## Acceptance Criteria
Each feature is complete when:
- Code is written and committed
- Tests pass (unit + integration)
- UI is responsive
- No TypeScript errors
- Progress marked in PRD.md