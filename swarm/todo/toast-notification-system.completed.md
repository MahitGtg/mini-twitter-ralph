# Feature: Toast Notification System

## Summary

Add a global toast notification system to provide non-blocking feedback for user actions. This was identified as an optional enhancement in the error-states-retry feature but was not implemented.

## Problem

Currently, feedback for user actions (like posting a tweet, following someone, or errors) is displayed inline within components. This approach:
- Can be missed if the user has scrolled away
- Creates inconsistent feedback patterns across the app
- Doesn't provide feedback for background operations
- Requires each component to manage its own status/error UI

## Solution

Create a centralized toast notification system with:
1. A `ToastContext` for global state management
2. A `Toast` component for rendering individual notifications
3. A `ToastContainer` component for positioning toasts
4. A `useToast` hook for easy access from any component

## Implementation Details

### 1. Create Toast Context

Create `src/contexts/ToastContext.tsx`:
- State management for active toasts
- Functions: `showToast`, `dismissToast`, `clearToasts`
- Toast types: `success`, `error`, `info`, `warning`
- Auto-dismiss after configurable duration (default: 4 seconds)
- Maximum toasts visible at once (default: 3)

### 2. Create Toast Component

Create `src/components/ui/Toast.tsx`:
- Animated entrance/exit (slide in from right/bottom)
- Color-coded by type (green=success, red=error, blue=info, yellow=warning)
- Dismiss button
- Progress bar showing time until auto-dismiss
- Icon per type

### 3. Create ToastContainer Component

Create `src/components/ui/ToastContainer.tsx`:
- Fixed position (bottom-right or top-right)
- Stacks multiple toasts vertically
- Handles overflow gracefully

### 4. Create useToast Hook

Create `src/hooks/useToast.ts`:
- Simple interface: `const { toast } = useToast()`
- Usage: `toast.success("Tweet posted!")` or `toast.error("Failed to post")`

### 5. Integrate with Existing Components

Update components to use toast notifications:

**TweetComposer.tsx:**
- Show success toast on tweet posted
- Show error toast on failure (in addition to retry UI)

**TweetCard.tsx:**
- Show success toast on delete
- Show success toast on like/unlike

**ProfileHeader.tsx:**
- Show success toast on follow/unfollow
- Show success toast on profile update

**SignInForm.tsx / SignUpForm.tsx:**
- Show error toast for network failures

### 6. Add ToastProvider to App

Wrap the app with `ToastProvider` in the root layout or ConvexClientProvider.

## Code Examples

### Toast Context Pattern

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}
```

### Usage Pattern

```typescript
const { showToast } = useToast();

// In a component
const handleSubmit = async () => {
  try {
    await createTweet({ content });
    showToast({ type: 'success', message: 'Tweet posted!' });
  } catch (error) {
    showToast({ type: 'error', message: 'Failed to post tweet' });
  }
};
```

## Files to Create

- `src/contexts/ToastContext.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/ToastContainer.tsx`
- `src/hooks/useToast.ts`

## Files to Modify

- `src/components/ConvexClientProvider.tsx` (or root layout) - wrap with ToastProvider
- `src/components/tweets/TweetComposer.tsx` - add toast on success
- `src/components/tweets/TweetCard.tsx` - add toast on delete/like
- `src/components/user/ProfileHeader.tsx` - add toast on follow/profile update
- `src/components/auth/SignInForm.tsx` - add toast for network errors
- `src/components/auth/SignUpForm.tsx` - add toast for network errors

## Acceptance Criteria

- [ ] Toast notifications appear in a fixed position (bottom-right recommended)
- [ ] Toasts auto-dismiss after 4 seconds
- [ ] Toasts can be manually dismissed by clicking X
- [ ] Different toast types have distinct colors and icons
- [ ] Toasts animate in and out smoothly
- [ ] Multiple toasts stack without overlapping
- [ ] Toast system is accessible (ARIA live region)
- [ ] TweetComposer shows success toast on post
- [ ] TweetCard shows success toast on delete
- [ ] ProfileHeader shows toast on follow/unfollow

## Design Specifications

Toast appearance:
- Border radius: rounded-xl
- Shadow: shadow-lg
- Max width: 320px
- Padding: px-4 py-3
- Position: fixed bottom-4 right-4
- Z-index: 50

Colors by type:
- Success: bg-emerald-50 border-emerald-200 text-emerald-800
- Error: bg-rose-50 border-rose-200 text-rose-800  
- Info: bg-sky-50 border-sky-200 text-sky-800
- Warning: bg-amber-50 border-amber-200 text-amber-800

## Testing

1. Post a tweet → verify success toast appears
2. Delete a tweet → verify success toast appears
3. Follow a user → verify toast appears
4. Trigger network error → verify error toast appears
5. Multiple actions → verify toasts stack properly
6. Wait 4 seconds → verify auto-dismiss works
7. Click dismiss → verify manual dismiss works

## Estimated Complexity

Medium - requires new context, components, and updates to several existing components, but follows standard React patterns.

## Notes

- Added global toast provider, container, and toast UI with animations, icons, and progress.
- Integrated success/error toasts into tweet composer, tweet actions, profile actions, and auth flows.
