"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import UserAvatar from "@/components/user/UserAvatar";

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

  const followers = useQuery(api.social.getFollowers, { userId: user._id });
  const following = useQuery(api.social.getFollowing, { userId: user._id });
  const isFollowing = useQuery(api.social.isFollowing, { userId: user._id });
  const tweetCount = useQuery(api.tweets.getUserTweetCount, { userId: user._id });

  const updateProfile = useMutation(api.users.updateProfile);
  const follow = useMutation(api.social.follow);
  const unfollow = useMutation(api.social.unfollow);

  const followerCount = followers?.length ?? 0;
  const followingCount = following?.length ?? 0;

  const handleToggleFollow = async () => {
    if (isFollowing) {
      await unfollow({ userId: user._id });
    } else {
      await follow({ userId: user._id });
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
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to update profile.",
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
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
            <p className="mt-2 text-xs text-slate-500">
              <span>{tweetCount ?? 0} tweets</span>
              {" · "}
              <Link
                href={`/profile/${user.username}/followers`}
                className="hover:underline"
              >
                {followerCount} followers
              </Link>
              {" · "}
              <Link
                href={`/profile/${user.username}/following`}
                className="hover:underline"
              >
                {followingCount} following
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentUser ? (
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              {isEditing ? "Cancel" : "Edit profile"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleFollow}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
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
