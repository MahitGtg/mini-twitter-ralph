# Keyboard Shortcuts for Tweet Composer

## Summary
Add keyboard shortcuts to the tweet composer to improve UX. The most important shortcut is `Ctrl+Enter` (or `Cmd+Enter` on Mac) to submit a tweet, which is a standard pattern in modern web apps.

## Problem
Currently, users must click the "Tweet" button to submit a tweet. This breaks the flow for users who prefer keyboard-centric navigation and is inconsistent with common web app patterns (e.g., Slack, Discord, GitHub comments all support Ctrl+Enter).

## Solution
Add keyboard event handling to the tweet composer textarea with the following shortcuts:

1. **Ctrl+Enter / Cmd+Enter** - Submit the tweet (if valid)
2. **Escape** - Clear the textarea content (optional, secondary)

## Implementation Details

### File to Modify
`mini-twitter/src/components/tweets/TweetComposer.tsx`

### Changes Required

1. Add a `handleKeyDown` function that checks for:
   - `event.key === 'Enter'` AND (`event.ctrlKey` OR `event.metaKey`)
   - If conditions met and content is valid, call the submit logic

2. Attach the handler to the textarea's `onKeyDown` prop

3. Ensure the shortcut respects the same validation as the button:
   - Not empty
   - Not over character limit
   - Not currently loading

### Code Pattern

```typescript
const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
  // Ctrl+Enter or Cmd+Enter to submit
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    if (content.trim() && !isOverLimit && !isLoading) {
      handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  }
};
```

### Accessibility
- Add a hint below the textarea or on the button showing the keyboard shortcut (e.g., "Ctrl+Enter to post")
- The hint can be subtle/secondary text

## Acceptance Criteria
- [ ] Pressing Ctrl+Enter (Windows/Linux) submits the tweet when content is valid
- [ ] Pressing Cmd+Enter (macOS) submits the tweet when content is valid
- [ ] Shortcut does nothing when content is empty, over limit, or loading
- [ ] Visual hint for the keyboard shortcut is displayed to users
- [ ] Existing button functionality remains unchanged

## Testing
1. Type a valid tweet content
2. Press Ctrl+Enter (or Cmd+Enter on Mac)
3. Verify the tweet is posted
4. Verify the textarea is cleared after successful post
5. Test edge cases: empty content, over limit, during loading state

## Notes
- Added Ctrl/Cmd+Enter submit, Escape clear, and a shortcut hint in the composer.
