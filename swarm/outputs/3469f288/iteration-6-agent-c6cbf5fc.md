Refactor applied in `mini-twitter/src/components/tweets/TweetFeed.tsx`.

- Introduced `isLikesView`/`isUserView` flags to reduce nested ternaries.
- Simplified query skip logic and empty-state message selection.

No tests run.
