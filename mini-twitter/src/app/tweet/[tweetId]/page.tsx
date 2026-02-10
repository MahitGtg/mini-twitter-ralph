"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import MainLayout from "@/components/layout/MainLayout";
import TweetCard from "@/components/tweets/TweetCard";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";

function LoadingState() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <TweetSkeleton />
      </div>
    </MainLayout>
  );
}

function NotFoundState({ tweetId }: { tweetId: string }) {
  return (
    <MainLayout>
      <div className="space-y-4">
        <Link href="/" className="text-slate-500 hover:text-slate-700">
          ← Back
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Tweet not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The tweet {tweetId} doesn&apos;t exist or may have been deleted.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default function TweetDetailPage() {
  const params = useParams<{ tweetId?: string | string[] }>();
  const rawTweetId = params?.tweetId;
  const tweetId = Array.isArray(rawTweetId) ? rawTweetId[0] : rawTweetId;
  const tweetIdValue = tweetId as Id<"tweets"> | undefined;

  const tweet = useQuery(
    api.tweets.getTweetById,
    tweetIdValue ? { tweetId: tweetIdValue } : "skip",
  );
  const currentUser = useQuery(api.users.getCurrentUser);

  if (!tweetId) {
    return <NotFoundState tweetId="unknown" />;
  }

  if (tweet === undefined) {
    return <LoadingState />;
  }

  if (tweet === null) {
    return <NotFoundState tweetId={tweetId} />;
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-slate-700">
            ← Back
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">Tweet</h1>
        </div>
        <TweetCard
          tweet={tweet}
          author={tweet.author ?? null}
          currentUserId={currentUser?._id}
        />
      </div>
    </MainLayout>
  );
}
