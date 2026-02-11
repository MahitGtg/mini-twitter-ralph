# Feature: Error States with Retry Functionality

## Summary

Implement a consistent error handling pattern across the application with clear error states and retry functionality for failed mutations/queries. This addresses the unchecked item in PLAN.md under "Polish & robustness":

> - [ ] Clear error states and retry for failed mutations/queries

## Current State

- Error messages are displayed inline in components (TweetCard, TweetComposer, SignInForm, SignUpForm)
- No retry functionality exists - users must manually refresh or re-attempt actions
- No consistent error UI pattern across the app
- Network failures and Convex errors are handled inconsistently

## Proposed Implementation

### 1. Create ErrorBoundary Component

Create `src/components/ui/ErrorBoundary.tsx` with:
- React error boundary to catch rendering errors
- Fallback UI showing error message with retry button
- Optional custom fallback prop for specific use cases

### 2. Create RetryableError Component

Create `src/components/ui/RetryableError.tsx` with:
- Consistent error display UI (icon, message, retry button)
- Automatic retry with exponential backoff option
- Loading state during retry
- Props: `error`, `onRetry`, `retryLabel`

### 3. Create useRetryableMutation Hook

Create `src/hooks/useRetryableMutation.ts`:
- Wrapper around Convex useMutation
- Tracks error state and provides retry function
- Optional auto-retry on transient failures
- Exposes: `execute`, `error`, `isLoading`, `retry`, `clearError`

### 4. Update Existing Components

Update components to use new error patterns:

**TweetComposer.tsx:**
- Use useRetryableMutation for createTweet
- Show RetryableError with retry button on failure

**TweetCard.tsx:**
- Use useRetryableMutation for likeTweet, unlikeTweet, deleteTweet
- Show inline retry option on failure

**SignInForm.tsx & SignUpForm.tsx:**
- Use RetryableError component for auth failures
- Distinguish between validation errors (no retry) and network errors (retry)

**TweetFeed.tsx:**
- Wrap query results with error boundary
- Show retry option if feed fails to load

**ProfileHeader.tsx:**
- Add retry for follow/unfollow mutations

### 5. Global Error Toast (Optional Enhancement)

Consider adding a toast system for transient errors:
- Create `src/components/ui/Toast.tsx`
- Create `src/contexts/ToastContext.tsx`
- Show non-blocking toasts for minor errors with auto-dismiss

## Implementation Steps

1. Create `src/components/ui/` directory
2. Implement ErrorBoundary component
3. Implement RetryableError component  
4. Implement useRetryableMutation hook
5. Update TweetComposer with retry support
6. Update TweetCard with retry support
7. Update auth forms with retry support
8. Update TweetFeed with error boundary
9. Update ProfileHeader with retry support
10. Test error scenarios (network offline, server errors)

## Success Criteria

- [ ] All mutations have visible retry option on failure
- [ ] Queries that fail show error state with retry button
- [ ] Error messages are clear and actionable
- [ ] Retry actually re-attempts the failed operation
- [ ] Loading state shown during retry attempts
- [ ] No breaking changes to existing functionality

## Files to Create

- `src/components/ui/ErrorBoundary.tsx`
- `src/components/ui/RetryableError.tsx`
- `src/hooks/useRetryableMutation.ts`

## Files to Modify

- `src/components/tweets/TweetComposer.tsx`
- `src/components/tweets/TweetCard.tsx`
- `src/components/tweets/TweetFeed.tsx`
- `src/components/auth/SignInForm.tsx`
- `src/components/auth/SignUpForm.tsx`
- `src/components/user/ProfileHeader.tsx`

## Estimated Complexity

Medium - requires new components and refactoring existing error handling patterns, but no new backend changes needed.

## Completion Notes

- Added `ErrorBoundary`, `RetryableError`, and `useRetryableMutation` helpers.
- Wired retryable error UI into tweet composer/card/feed, auth forms, and profile follow actions.
- Kept existing validation messaging while surfacing retry options for network-style failures.
