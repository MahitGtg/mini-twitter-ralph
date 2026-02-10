"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import UserAvatar from "@/components/user/UserAvatar";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import RetryableError from "@/components/ui/RetryableError";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useRetryableMutation } from "@/hooks/useRetryableMutation";
import TweetContent from "@/components/tweets/TweetContent";
import { useToast } from "@/hooks/useToast";

interface TweetCardProps {
  tweet: Doc<"tweets">;
  author: Doc<"users"> | null;
  currentUserId?: Id<"users">;
  onDeleted?: (tweetId: Id<"tweets">) => void;
}

export default function TweetCard({
  tweet,
  author,
  currentUserId,
  onDeleted,
}: TweetCardProps) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const likeCount = useQuery(api.likes.getTweetLikes, { tweetId: tweet._id });
  const hasLiked = useQuery(api.likes.hasLiked, { tweetId: tweet._id });
  const likeTweet = useRetryableMutation(api.likes.likeTweet);
  const unlikeTweet = useRetryableMutation(api.likes.unlikeTweet);
  const deleteTweet = useRetryableMutation(api.tweets.deleteTweet);
  const relativeTime = useRelativeTime(tweet.createdAt);
  const { copied: hasCopied, copy } = useCopyToClipboard();
  const { toast } = useToast();
  const isOwner = Boolean(currentUserId && tweet.userId === currentUserId);
  const isLiking = likeTweet.isLoading || unlikeTweet.isLoading;
  const isDeleting = deleteTweet.isLoading;
  const deleteError = deleteTweet.error;
  const likeError = likeTweet.error;
  const unlikeError = unlikeTweet.error;
  const retryTargets = [
    { error: deleteError, retry: deleteTweet.retry, label: "Retry delete" },
    { error: likeError, retry: likeTweet.retry, label: "Retry like" },
    { error: unlikeError, retry: unlikeTweet.retry, label: "Retry unlike" },
  ];
  const activeRetry = retryTargets.find((target) => target.error);
  const actionError = activeRetry?.error;
  const retryHandler = activeRetry?.retry;
  const retryLabel = activeRetry?.label ?? "Retry";

  const authorName = author?.name || author?.username || "Unknown user";
  const authorHandle = author?.username ? `@${author.username}` : "unknown";
  const profileHref = author?.username ? `/profile/${author.username}` : undefined;
  const authorWrapperClass = profileHref
    ? "group inline-flex flex-col"
    : "flex flex-col";
  const authorNameClass = `text-sm font-semibold text-slate-900${
    profileHref ? " group-hover:underline" : ""
  }`;
  const authorHandleClass = `text-xs text-slate-500${
    profileHref ? " group-hover:text-slate-700" : ""
  }`;
  const tweetHref = `/tweet/${tweet._id}`;

  const navigateToTweet = () => {
    router.push(tweetHref);
  };

  const handleToggleLike = async () => {
    if (isLiking || hasLiked === undefined) {
      return;
    }
    likeTweet.clearError();
    unlikeTweet.clearError();
    deleteTweet.clearError();
    try {
      if (hasLiked) {
        await unlikeTweet.execute({ tweetId: tweet._id });
        toast.success("Removed like.");
      } else {
        await likeTweet.execute({ tweetId: tweet._id });
        toast.success("Liked tweet.");
      }
    } catch {
    }
  };

  const handleDelete = async () => {
    if (!isOwner || isDeleting) {
      return;
    }
    deleteTweet.clearError();
    try {
      await deleteTweet.execute({ tweetId: tweet._id });
      setIsDeleted(true);
      onDeleted?.(tweet._id);
      setShowDeleteConfirm(false);
      toast.success("Tweet deleted.");
    } catch {
      setShowDeleteConfirm(false);
    }
  };

  const handleCopyLink = async () => {
    if (typeof window === "undefined") {
      return;
    }
    await copy(`${window.location.origin}${tweetHref}`);
  };

  const handleContentKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToTweet();
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-6">
      <div className="flex gap-3 sm:gap-4">
        <UserAvatar
          username={author?.username}
          name={author?.name}
          avatarUrl={author?.avatarUrl}
          size="md"
          href={profileHref}
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              {profileHref ? (
                <Link href={profileHref} className={authorWrapperClass}>
                  <p className={authorNameClass}>{authorName}</p>
                  <p className={authorHandleClass}>{authorHandle}</p>
                </Link>
              ) : (
                <div className={authorWrapperClass}>
                  <p className={authorNameClass}>{authorName}</p>
                  <p className={authorHandleClass}>{authorHandle}</p>
                </div>
              )}
            </div>
            <Link
              href={tweetHref}
              className="text-xs text-slate-400 transition hover:text-slate-600"
            >
              {relativeTime}
            </Link>
          </div>
          <div
            role="link"
            tabIndex={0}
            onClick={navigateToTweet}
            onKeyDown={handleContentKeyDown}
            className="block break-words whitespace-pre-wrap text-sm text-slate-800 transition hover:text-slate-900"
          >
            <TweetContent content={tweet.content} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isLiking || hasLiked === undefined}
              aria-pressed={Boolean(hasLiked)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 transition ${
                hasLiked
                  ? "border-transparent bg-sky-50 text-[#1DA1F2]"
                  : "border-slate-200 hover:border-slate-300 hover:text-slate-700"
              } ${isLiking ? "opacity-60" : ""}`}
            >
              <span>{hasLiked ? "Liked" : "Like"}</span>
              <span aria-hidden="true"> </span>
              <span className="font-semibold text-slate-700">
                {likeCount === undefined ? "..." : likeCount}
              </span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 transition ${
                hasCopied
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {hasCopied ? "Copied!" : "Copy Link"}
            </button>
            {isOwner ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-2 text-rose-500 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
              >
                Delete
              </button>
            ) : null}
          </div>
          {actionError ? (
            <RetryableError
              error={actionError}
              onRetry={retryHandler}
              retryLabel={retryLabel}
              variant="inline"
            />
          ) : null}
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Tweet?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </article>
  );
}
