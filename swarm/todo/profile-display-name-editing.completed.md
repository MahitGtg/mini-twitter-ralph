# Profile Display Name Editing

## Problem

Users can edit their username, bio, and avatarUrl in the profile editor, but they cannot edit their display **name** (the `name` field). The display name is shown prominently on profile pages (e.g., "John Doe" above "@johndoe"), but there's no way to change it after account creation.

## Solution

Add display name editing to both the backend mutation and the frontend profile editor.

## Implementation Plan

### 1. Backend: Update `convex/users.ts`

Add `name` field support to the `updateProfile` mutation:

```typescript
export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    name: v.optional(v.string()),  // ADD THIS
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // ... existing code ...
    
    // Add name handling
    if (args.name !== undefined) {
      updates.name = args.name.trim() || undefined;  // Allow clearing name
    }
    
    // ... rest of handler
  },
});
```

### 2. Frontend: Update `ProfileHeader.tsx`

Add name field to the edit form:

1. Add state: `const [name, setName] = useState(user.name ?? "");`
2. Include in save: pass `name` to `updateProfile` mutation
3. Add input field in the editing section, styled consistently with existing inputs

### 3. Tests

Add test cases to `convex/users.test.ts`:
- Can update display name
- Can clear display name (set to empty string)
- Name is trimmed of whitespace

## Files to Modify

- `mini-twitter/convex/users.ts` - Add `name` to mutation args and handler
- `mini-twitter/src/components/user/ProfileHeader.tsx` - Add name input to edit form
- `mini-twitter/convex/users.test.ts` - Add test cases for name updates

## Acceptance Criteria

- [ ] Users can edit their display name from profile page
- [ ] Display name can be cleared (reverts to showing username)
- [ ] Changes are immediately reflected in the UI
- [ ] Proper validation (trim whitespace)
- [ ] Tests pass for the new functionality

## Notes

- Added name support to `updateProfile`, profile edit UI input, and backend tests for trim/clear.
