"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import TweetCard from "@/components/tweets/TweetCard";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import RetryableError from "@/components/ui/RetryableError";
import { usePaginatedFeed } from "@/hooks/usePaginatedFeed";

interface TweetFeedProps {
  userId?: Id<"users">;
  likedByUserId?: Id<"users">;
  currentUserId?: Id<"users">;
}

export default function TweetFeed({
  userId,
  likedByUserId,
  currentUserId,
}: TweetFeedProps) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <ErrorBoundary
      resetKey={retryKey}
      onRetry={() => setRetryKey((prev) => prev + 1)}
      fallback={(error, reset) => (
        <RetryableError
          error={error}
          onRetry={reset}
          retryLabel="Reload feed"
        />
      )}
    >
      <TweetFeedContent
        key={retryKey}
        userId={userId}
        likedByUserId={likedByUserId}
        currentUserId={currentUserId}
      />
    </ErrorBoundary>
  );
}

function TweetFeedContent({
  userId,
  likedByUserId,
  currentUserId,
}: TweetFeedProps) {
  const [deletedTweetIds, setDeletedTweetIds] = useState<Set<Id<"tweets">>>(
    () => new Set(),
  );
  const isLikesView = Boolean(likedByUserId);
  const isUserView = Boolean(userId);
  const isProfileFeed = isLikesView || isUserView;
  const feedType = isLikesView ? "likes" : isUserView ? "user" : "home";
  const feedOwnerId = isLikesView ? likedByUserId : userId;
  const {
    tweets,
    isLoading,
    isLoadingMore,
    canLoadMore,
    isExhausted,
    loadMore,
  } = usePaginatedFeed(feedType, feedOwnerId);

  if (isLoading) {
    return (
      <div className={isProfileFeed ? "space-y-3" : "space-y-4"}>
        <TweetSkeleton />
        <TweetSkeleton />
        <TweetSkeleton />
      </div>
    );
  }

  const visibleTweets = tweets.filter((tweet) => !deletedTweetIds.has(tweet._id));

  if (visibleTweets.length === 0 && isExhausted) {
    const emptyMessage = isUserView
      ? "No tweets yet."
      : "No tweets yet. Follow people to see updates.";

    if (isLikesView) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-700">No liked tweets yet.</p>
          <p className="mt-1 text-sm text-slate-500">Like tweets to see them here.</p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  const spacing = isProfileFeed ? "space-y-3" : "space-y-4";

  return (
    <div className="space-y-4">
      <div className={spacing}>
        {visibleTweets.map((tweet) => (
          <TweetCard
            key={tweet._id}
            tweet={tweet}
            author={tweet.author ?? null}
            currentUserId={currentUserId}
            onDeleted={(tweetId) => {
              setDeletedTweetIds((previous) => new Set(previous).add(tweetId));
            }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 pt-1">
        {canLoadMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="rounded-full border border-sky-200 bg-sky-50 px-6 py-2 text-sm font-medium text-sky-600 transition hover:bg-sky-100 disabled:opacity-60"
          >
            {isLoadingMore ? "Loading..." : "Load more tweets"}
          </button>
        )}
        {isExhausted && visibleTweets.length > 0 && (
          <p className="text-center text-sm text-slate-400">
            You&apos;ve reached the end
          </p>
        )}
      </div>
    </div>
  );
}
