"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import UserAvatar from "@/components/user/UserAvatar";
import RetryableError from "@/components/ui/RetryableError";
import { useRetryableMutation } from "@/hooks/useRetryableMutation";
import { useToast } from "@/hooks/useToast";

type ProfileHeaderProps = {
  user: Doc<"users">;
  isCurrentUser: boolean;
};

export default function ProfileHeader({ user, isCurrentUser }: ProfileHeaderProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [status, setStatus] = useState("");
  const [followStatus, setFollowStatus] = useState("");
  const { toast } = useToast();

  const followers = useQuery(api.social.getFollowers, { userId: user._id });
  const following = useQuery(api.social.getFollowing, { userId: user._id });
  const isFollowing = useQuery(api.social.isFollowing, { userId: user._id });
  const tweetCount = useQuery(api.tweets.getUserTweetCount, { userId: user._id });

  const updateProfile = useMutation(api.users.updateProfile);
  const follow = useRetryableMutation(api.social.follow);
  const unfollow = useRetryableMutation(api.social.unfollow);
  const isTogglingFollow = follow.isLoading || unfollow.isLoading;
  const followRetryTargets = [
    { error: follow.error, retry: follow.retry, label: "Retry follow" },
    { error: unfollow.error, retry: unfollow.retry, label: "Retry unfollow" },
  ];
  const activeFollowRetry = followRetryTargets.find((target) => target.error);
  const followError = activeFollowRetry?.error;
  const followRetry = activeFollowRetry?.retry;
  const followRetryLabel = activeFollowRetry?.label ?? "Retry";

  const followerCount = followers?.length ?? 0;
  const followingCount = following?.length ?? 0;

  const handleToggleFollow = async () => {
    if (isFollowing === undefined) {
      return;
    }
    setFollowStatus("");
    follow.clearError();
    unfollow.clearError();
    try {
      if (isFollowing) {
        await unfollow.execute({ userId: user._id });
        setFollowStatus(`Unfollowed @${user.username}.`);
        toast.success(`Unfollowed @${user.username}.`);
      } else {
        await follow.execute({ userId: user._id });
        setFollowStatus(`Followed @${user.username}.`);
        toast.success(`Followed @${user.username}.`);
      }
    } catch {
    }
  };

  const handleSave = async () => {
    setStatus("");
    try {
      const updated = await updateProfile({
        username: username.trim(),
        bio,
        avatarUrl,
      });
      setIsEditing(false);
      if (updated?.username && updated.username !== user.username) {
        router.replace(`/profile/${updated.username}`);
      }
      setStatus("Profile updated.");
      toast.success("Profile updated.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to update profile.",
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <UserAvatar
            username={user.username}
            name={user.name}
            avatarUrl={user.avatarUrl}
            size="lg"
          />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {user.name ?? user.username}
            </h1>
            <p className="text-sm text-slate-500">@{user.username}</p>
            <p className="mt-2 text-sm text-slate-600">{user.bio}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="font-medium text-slate-700">{tweetCount ?? 0} Tweets</span>
              <Link
                href={`/profile/${user.username}/followers`}
                className="inline-flex items-baseline gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="font-semibold">{followerCount}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500">Followers</span>
              </Link>
              <Link
                href={`/profile/${user.username}/following`}
                className="inline-flex items-baseline gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="font-semibold">{followingCount}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500">Following</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex min-h-[3.25rem] w-full flex-col items-start justify-center gap-2 sm:w-auto">
          {isCurrentUser ? (
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 sm:w-auto"
            >
              {isEditing ? "Cancel" : "Edit profile"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={isTogglingFollow}
                className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto"
              >
                {isTogglingFollow ? "Updating..." : isFollowing ? "Unfollow" : "Follow"}
              </button>
              <div className="h-5">
                {followStatus ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {followStatus}
                  </span>
                ) : null}
              </div>
              {followError ? (
                <RetryableError
                  error={followError}
                  onRetry={followRetry}
                  retryLabel={followRetryLabel}
                  variant="inline"
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-600">
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-600">
            Avatar URL
            <input
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-600 sm:col-span-2">
            Bio
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={3}
              className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
            />
          </label>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Save changes
            </button>
            {status ? <span className="text-sm text-slate-500">{status}</span> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
