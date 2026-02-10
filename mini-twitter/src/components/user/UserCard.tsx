"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UserAvatar from "@/components/user/UserAvatar";
import { Doc } from "@/convex/_generated/dataModel";

type UserCardProps = {
  user: Doc<"users">;
  currentUserId?: Doc<"users">["_id"];
  compact?: boolean;
};

export default function UserCard({ user, currentUserId, compact = false }: UserCardProps) {
  const isFollowing = useQuery(api.social.isFollowing, { userId: user._id });
  const follow = useMutation(api.social.follow);
  const unfollow = useMutation(api.social.unfollow);
  const followers = useQuery(
    api.social.getFollowers,
    compact ? "skip" : { userId: user._id },
  );
  const following = useQuery(
    api.social.getFollowing,
    compact ? "skip" : { userId: user._id },
  );

  const followerCount = followers?.length ?? 0;
  const followingCount = following?.length ?? 0;
  const showFollowButton = Boolean(currentUserId && currentUserId !== user._id);

  const handleToggleFollow = async () => {
    if (isFollowing) {
      await unfollow({ userId: user._id });
    } else {
      await follow({ userId: user._id });
    }
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <UserAvatar
          username={user.username}
          name={user.name}
          avatarUrl={user.avatarUrl}
          href={`/profile/${user.username}`}
        />
        <div>
          <Link
            href={`/profile/${user.username}`}
            className="group inline-flex flex-col"
          >
            <p className="text-sm font-semibold text-slate-900 group-hover:underline">
              {user.name ?? user.username}
            </p>
            <p className="text-xs text-slate-500 group-hover:text-slate-700">
              @{user.username}
            </p>
          </Link>
          {compact ? null : (
            <p className="mt-1 text-xs text-slate-500">
              {followerCount} followers · {followingCount} following
            </p>
          )}
        </div>
      </div>
      {showFollowButton ? (
        <button
          type="button"
          onClick={handleToggleFollow}
          className="inline-flex w-24 items-center justify-center rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      ) : null}
    </div>
  );
}
