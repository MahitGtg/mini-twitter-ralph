# Feature: Testing Infrastructure and Test Suite

## Priority: HIGH (Required by completion criteria but completely missing)

## Problem
The PLAN.md completion criteria explicitly requires "Tests passing (>60% coverage)" but the project has **zero tests**. There are no test files (`*.test.ts`, `*.spec.ts`), no test configuration, and no testing dependencies installed. This is a critical gap that blocks the project from being considered complete.

## Goal
Set up a complete testing infrastructure and write comprehensive tests for:
1. Convex backend functions (unit tests)
2. React components (component tests)
3. End-to-end user flows (E2E tests using playwright-cli per AGENTS.md)

## Dependencies
- Convex backend setup (completed)
- Frontend UI implementation (in progress - tests can be written for existing components)

## Tasks

### 1. Install Testing Dependencies

In `mini-twitter/` directory:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react convex-test
```

For E2E testing, playwright-cli is already recommended in AGENTS.md:
```bash
npm install -g @mj1618/playwright-cli
```

### 2. Configure Vitest (`mini-twitter/vitest.config.ts`)

Create vitest configuration for both unit and component tests:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'convex/_generated/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/convex': path.resolve(__dirname, './convex'),
    },
  },
});
```

### 3. Create Test Setup File (`mini-twitter/src/test/setup.ts`)

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Convex hooks for component tests
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
  useConvex: vi.fn(),
}));

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: vi.fn(() => ({
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));
```

### 4. Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright-cli start && npm run test:e2e:run",
    "test:e2e:run": "vitest run --config vitest.e2e.config.ts"
  }
}
```

### 5. Write Convex Function Tests

#### `mini-twitter/convex/tweets.test.ts`
Test cases:
- `createTweet`: rejects when not authenticated
- `createTweet`: rejects empty content
- `createTweet`: rejects content over 300 characters
- `createTweet`: successfully creates tweet with valid content
- `deleteTweet`: rejects when not authenticated
- `deleteTweet`: rejects when tweet doesn't exist
- `deleteTweet`: rejects when deleting another user's tweet
- `deleteTweet`: successfully deletes own tweet
- `getFeed`: returns empty array when not authenticated
- `getFeed`: returns own tweets and followed users' tweets
- `getUserTweets`: returns tweets for specified user

#### `mini-twitter/convex/likes.test.ts`
Test cases:
- `likeTweet`: rejects when not authenticated
- `likeTweet`: rejects when tweet doesn't exist
- `likeTweet`: creates like successfully
- `likeTweet`: is idempotent (returns existing like if already liked)
- `unlikeTweet`: removes existing like
- `unlikeTweet`: returns null if not liked
- `getTweetLikes`: returns correct count
- `hasLiked`: returns true/false correctly

#### `mini-twitter/convex/social.test.ts`
Test cases:
- `follow`: rejects when not authenticated
- `follow`: rejects self-follow
- `follow`: creates follow relationship
- `follow`: is idempotent
- `unfollow`: removes follow relationship
- `getFollowers`: returns correct list
- `getFollowing`: returns correct list
- `isFollowing`: returns true/false correctly

#### `mini-twitter/convex/users.test.ts`
Test cases:
- `getCurrentUser`: returns null when not authenticated
- `getCurrentUser`: returns user when authenticated
- `getUserById`: returns user or null
- `getUserByUsername`: normalizes username and finds user
- `updateProfile`: rejects when not authenticated
- `updateProfile`: rejects duplicate username
- `updateProfile`: updates fields correctly

### 6. Write React Component Tests

#### `mini-twitter/src/components/tweets/TweetComposer.test.tsx`
Test cases:
- Renders textarea and submit button
- Shows character count
- Disables button when content is empty
- Disables button when content exceeds 300 characters
- Calls createTweet mutation on submit
- Shows loading state while submitting
- Clears input after successful submit
- Shows error message on failure

#### `mini-twitter/src/components/auth/SignInForm.test.tsx`
Test cases:
- Renders email and password inputs
- Validates required fields
- Calls signIn action with correct parameters
- Shows loading state during submission
- Shows error on invalid credentials

#### `mini-twitter/src/components/auth/SignUpForm.test.tsx`
Test cases:
- Renders all required inputs (email, password, confirm password, username)
- Validates password confirmation matches
- Calls signIn action with signUp flow
- Shows error messages appropriately

#### `mini-twitter/src/components/user/UserCard.test.tsx`
Test cases:
- Renders user avatar and username
- Shows follow button for other users
- Hides follow button for own profile
- Calls follow/unfollow mutations correctly

### 7. Write E2E Tests Using Playwright-CLI

#### `mini-twitter/e2e/auth.e2e.ts`
Test cases:
- User can sign up with email/password
- User can sign in with existing credentials
- User can sign out
- Invalid credentials show error

#### `mini-twitter/e2e/tweets.e2e.ts`
Test cases:
- Authenticated user can compose and post tweet
- Tweet appears in feed after posting
- User can delete own tweet
- User cannot delete others' tweets

#### `mini-twitter/e2e/social.e2e.ts`
Test cases:
- User can follow another user
- Followed user's tweets appear in feed
- User can unfollow
- User can like/unlike tweets

### 8. Add GitHub Actions CI Workflow (optional but recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
        working-directory: mini-twitter
      - run: npm run test:coverage
        working-directory: mini-twitter
      - run: npm run lint
        working-directory: mini-twitter
```

## Acceptance Criteria
- [ ] Vitest is configured and runs without errors
- [ ] All Convex function tests pass
- [ ] All React component tests pass
- [ ] E2E tests pass (using playwright-cli)
- [ ] Test coverage is above 60%
- [ ] `npm test` command works in mini-twitter directory
- [ ] Tests run in CI (if GitHub Actions configured)

## Notes
- Use `convex-test` package for testing Convex functions in isolation
- Mock Convex hooks in component tests to avoid needing a live backend
- E2E tests require the dev server running - use playwright-cli as specified in AGENTS.md
- Focus on testing business logic rather than implementation details
- For Convex function tests, refer to https://docs.convex.dev/testing for patterns

## Test File Structure

```
mini-twitter/
├── convex/
│   ├── tweets.test.ts
│   ├── likes.test.ts
│   ├── social.test.ts
│   └── users.test.ts
├── src/
│   ├── test/
│   │   └── setup.ts
│   └── components/
│       ├── auth/
│       │   ├── SignInForm.test.tsx
│       │   └── SignUpForm.test.tsx
│       ├── tweets/
│       │   └── TweetComposer.test.tsx
│       └── user/
│           └── UserCard.test.tsx
├── e2e/
│   ├── auth.e2e.ts
│   ├── tweets.e2e.ts
│   └── social.e2e.ts
└── vitest.config.ts
```

## Progress Notes (Agent d7104b2b, task 1a016e12)
- Added Vitest config, setup file, and unit/component tests; `npm run test:run` passes.
- Installed testing deps and fixed `UserCard` string escaping.
- Remaining: E2E tests (playwright-cli), coverage check (>60%), and optional CI workflow.
