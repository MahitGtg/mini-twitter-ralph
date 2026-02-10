Reviewed unstaged diff for pagination changes.

Fixes applied:
- Guarded `usePaginatedFeed` against missing `userId` for user/likes feeds by skipping the query and returning an exhausted empty state.

Notes:
- Main risk found: prior implementation cast `userId` to `Id<"users">` even when undefined, which could trigger runtime validation errors in Convex.
