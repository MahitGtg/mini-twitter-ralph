Refactor applied: deduplicated paginated tweet filtering in `convex/tweets.ts`.
Added `paginateFilteredTweets` helper using `PaginationOptions`/`QueryCtx` and reused it
for `getFeedPaginated` and `searchTweetsPaginated` to reduce duplicated paging loops.
