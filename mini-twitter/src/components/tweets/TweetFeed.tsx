"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import TweetCard from "@/components/tweets/TweetCard";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";

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
  const [deletedTweetIds, setDeletedTweetIds] = useState<Set<Id<"tweets">>>(
    () => new Set(),
  );
  const isLikesView = Boolean(likedByUserId);
  const isUserView = Boolean(userId);
  const isProfileFeed = isLikesView || isUserView;
  const feedTweets = useQuery(
    api.tweets.getFeed,
    isLikesView || isUserView ? "skip" : {},
  );
  const userTweets = useQuery(
    api.tweets.getUserTweets,
    userId ? { userId } : "skip",
  );
  const likedTweets = useQuery(
    api.likes.getLikedTweets,
    likedByUserId ? { userId: likedByUserId } : "skip",
  );
  let tweets = feedTweets;
  if (isUserView) {
    tweets = userTweets;
  }
  if (isLikesView) {
    tweets = likedTweets;
  }

  if (tweets === undefined) {
    return (
      <div className={isProfileFeed ? "space-y-3" : "space-y-4"}>
        <TweetSkeleton />
        <TweetSkeleton />
        <TweetSkeleton />
      </div>
    );
  }

  const visibleTweets = tweets.filter((tweet) => !deletedTweetIds.has(tweet._id));

  if (visibleTweets.length === 0) {
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

  return (
    <div className={isProfileFeed ? "space-y-3" : "space-y-4"}>
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
  );
}
