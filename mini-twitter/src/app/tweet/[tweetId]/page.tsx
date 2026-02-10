"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import MainLayout from "@/components/layout/MainLayout";
import TweetCard from "@/components/tweets/TweetCard";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";

const CONVEX_ID_PATTERN = /^[a-z0-9]+$/;

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
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
        >
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
  const hasValidTweetId = Boolean(
    tweetId && CONVEX_ID_PATTERN.test(tweetId) && tweetId.length >= 20,
  );
  const tweetIdValue = hasValidTweetId ? (tweetId as Id<"tweets">) : undefined;

  const tweet = useQuery(
    api.tweets.getTweetById,
    tweetIdValue ? { tweetId: tweetIdValue } : "skip",
  );
  const currentUser = useQuery(api.users.getCurrentUser);

  if (!tweetId || !hasValidTweetId) {
    return <NotFoundState tweetId={tweetId ?? "unknown"} />;
  }

  if (tweet === undefined) {
    return <LoadingState />;
  }

  if (tweet === null) {
    return <NotFoundState tweetId={tweetId} />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <Link
          href="/"
          className="inline-flex w-fit items-center rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
        >
          ← Back
        </Link>
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-slate-900">Tweet</h1>
          <TweetCard
            tweet={tweet}
            author={tweet.author ?? null}
            currentUserId={currentUser?._id}
          />
        </div>
      </div>
    </MainLayout>
  );
}
