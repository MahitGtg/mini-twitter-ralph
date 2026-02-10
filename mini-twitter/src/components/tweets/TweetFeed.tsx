"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import TweetCard from "@/components/tweets/TweetCard";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";

interface TweetFeedProps {
  userId?: Id<"users">;
  currentUserId?: Id<"users">;
}

export default function TweetFeed({ userId, currentUserId }: TweetFeedProps) {
  const feedTweets = useQuery(api.tweets.getFeed, userId ? "skip" : {});
  const userTweets = useQuery(
    api.tweets.getUserTweets,
    userId ? { userId } : "skip",
  );
  const tweets = userId ? userTweets : feedTweets;

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
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        {userId
          ? "No tweets yet."
          : "No tweets yet. Follow people to see updates."}
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
