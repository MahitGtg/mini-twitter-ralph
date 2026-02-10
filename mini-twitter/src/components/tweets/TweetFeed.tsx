"use client";

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
  const isLikesView = Boolean(likedByUserId);
  const isUserView = Boolean(userId);
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
      <div className="space-y-4">
        <TweetSkeleton />
        <TweetSkeleton />
        <TweetSkeleton />
      </div>
    );
  }

  if (tweets.length === 0) {
    const emptyMessage = isLikesView
      ? "No liked tweets yet."
      : isUserView
        ? "No tweets yet."
        : "No tweets yet. Follow people to see updates.";
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet._id}
          tweet={tweet}
          author={tweet.author ?? null}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
