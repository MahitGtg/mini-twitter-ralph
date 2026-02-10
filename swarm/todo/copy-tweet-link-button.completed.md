# Feature: Copy Tweet Link Button

## Summary
Add a "Copy Link" button to TweetCard that allows users to quickly copy the shareable tweet URL to their clipboard. This completes the "shareable link" story from the PLAN.md by making links easily shareable.

## Motivation
- Tweet detail pages already have shareable URLs (`/tweet/{tweetId}`)
- Currently there's no easy way for users to copy these links
- This is a standard feature on Twitter and other social platforms
- Improves UX by enabling quick sharing

## Implementation Details

### 1. Create a useCopyToClipboard hook
**File:** `mini-twitter/src/hooks/useCopyToClipboard.ts`

```typescript
import { useState, useCallback } from "react";

export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
      return true;
    } catch {
      return false;
    }
  }, [resetDelay]);

  return { copied, copy };
}
```

### 2. Add Copy Link button to TweetCard
**File:** `mini-twitter/src/components/tweets/TweetCard.tsx`

Add a "Copy Link" button in the action row next to Like and Delete buttons:
- Use the `useCopyToClipboard` hook
- Generate the full URL using `window.location.origin + '/tweet/' + tweet._id`
- Show "Copied!" feedback after successful copy
- Style consistently with other action buttons

### 3. Button behavior
- Text shows "Copy Link" by default
- Changes to "Copied!" briefly (2 seconds) after successful copy
- Uses a subtle icon or just text
- Positioned between Like and Delete buttons

## Acceptance Criteria
- [ ] Copy Link button appears on all tweet cards
- [ ] Clicking copies the full tweet URL to clipboard
- [ ] Visual feedback shows "Copied!" state for 2 seconds
- [ ] Works on desktop and mobile browsers
- [ ] Button styling matches existing action buttons

## Testing
1. Navigate to home feed
2. Click "Copy Link" on any tweet
3. Verify button shows "Copied!" feedback
4. Paste in another app to verify correct URL was copied
5. Navigate to the pasted URL and verify it shows the correct tweet

## Notes
- Added `useCopyToClipboard` hook and copy button in `TweetCard` with feedback state.
