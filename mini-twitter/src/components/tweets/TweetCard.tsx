"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import UserAvatar from "@/components/user/UserAvatar";
import { useRelativeTime } from "@/hooks/useRelativeTime";

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
  const [status, setStatus] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const likeCount = useQuery(api.likes.getTweetLikes, { tweetId: tweet._id });
  const hasLiked = useQuery(api.likes.hasLiked, { tweetId: tweet._id });
  const likeTweet = useMutation(api.likes.likeTweet);
  const unlikeTweet = useMutation(api.likes.unlikeTweet);
  const deleteTweet = useMutation(api.tweets.deleteTweet);
  const relativeTime = useRelativeTime(tweet.createdAt);
  const isOwner = Boolean(currentUserId && tweet.userId === currentUserId);

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

  const handleToggleLike = async () => {
    if (isLiking || hasLiked === undefined) {
      return;
    }
    setStatus("");
    setIsLiking(true);
    try {
      if (hasLiked) {
        await unlikeTweet({ tweetId: tweet._id });
      } else {
        await likeTweet({ tweetId: tweet._id });
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update like.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || isDeleting) {
      return;
    }
    setStatus("");
    setIsDeleting(true);
    try {
      await deleteTweet({ tweetId: tweet._id });
      setIsDeleted(true);
      onDeleted?.(tweet._id);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to delete tweet.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300">
      <div className="flex gap-4">
        <UserAvatar
          username={author?.username}
          name={author?.name}
          avatarUrl={author?.avatarUrl}
          size="md"
          href={profileHref}
        />
        <div className="flex-1 space-y-3">
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
          <Link
            href={tweetHref}
            className="block whitespace-pre-wrap text-sm text-slate-800 transition hover:text-slate-900"
          >
            {tweet.content}
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isLiking || hasLiked === undefined}
              aria-pressed={Boolean(hasLiked)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
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
            {isOwner ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-rose-500 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            ) : null}
            {status ? <span className="text-rose-500">{status}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
