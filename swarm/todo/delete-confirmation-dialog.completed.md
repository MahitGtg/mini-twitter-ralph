# Feature: Delete Confirmation Dialog

## Summary
Add a confirmation dialog before deleting tweets to prevent accidental deletions. Currently, clicking "Delete" on a tweet immediately deletes it with no way to cancel or undo.

## Problem
- Clicking "Delete" on `TweetCard` immediately calls `deleteTweet.execute()` with no confirmation
- Users can accidentally delete tweets with a single misclick
- No way to undo or cancel after clicking delete
- Poor UX for destructive actions

## Solution
Create a reusable `ConfirmDialog` component and integrate it into the tweet delete flow.

## Implementation Steps

### 1. Create ConfirmDialog component
Create `/mini-twitter/src/components/ui/ConfirmDialog.tsx`:
- Modal overlay with backdrop
- Configurable title, message, and button labels
- Confirm and Cancel buttons
- Support for destructive variant (red confirm button)
- Keyboard support (Escape to close, Enter to confirm)
- Focus trap for accessibility

### 2. Update TweetCard to use ConfirmDialog
Modify `/mini-twitter/src/components/tweets/TweetCard.tsx`:
- Add `showDeleteConfirm` state
- Show ConfirmDialog when delete is clicked
- Only call `handleDelete()` when user confirms
- Pass appropriate props: "Delete Tweet?", "This action cannot be undone."

### 3. Component API
```tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;  // default: "Confirm"
  cancelLabel?: string;   // default: "Cancel"
  variant?: "default" | "destructive";  // default: "default"
  isLoading?: boolean;
}
```

## Files to Modify
- `mini-twitter/src/components/ui/ConfirmDialog.tsx` (new)
- `mini-twitter/src/components/tweets/TweetCard.tsx` (update)

## Acceptance Criteria
- [ ] Clicking Delete shows confirmation dialog
- [ ] Dialog has "Cancel" and "Delete" buttons
- [ ] Cancel closes dialog without deleting
- [ ] Confirm deletes the tweet
- [ ] Dialog shows loading state during deletion
- [ ] Pressing Escape closes the dialog
- [ ] Dialog has proper focus management
- [ ] Destructive variant shows red confirm button

## Testing
- Verify delete flow with dialog
- Test keyboard navigation (Tab, Escape, Enter)
- Verify dialog closes on successful delete
- Test cancel functionality

## Notes
- Added `ConfirmDialog` with focus trap, keyboard handling, and loading state.
- Wired `TweetCard` delete to prompt for confirmation before calling delete.
