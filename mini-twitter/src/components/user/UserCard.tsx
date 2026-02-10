"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UserAvatar from "@/components/user/UserAvatar";
import { Doc } from "@/convex/_generated/dataModel";

type UserCardProps = {
  user: Doc<"users">;
};

export default function UserCard({ user }: UserCardProps) {
  const isFollowing = useQuery(api.social.isFollowing, { userId: user._id });
  const follow = useMutation(api.social.follow);
  const unfollow = useMutation(api.social.unfollow);
  const followers = useQuery(api.social.getFollowers, { userId: user._id });
  const following = useQuery(api.social.getFollowing, { userId: user._id });

  const followerCount = followers?.length ?? 0;
  const followingCount = following?.length ?? 0;

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
          <p className="text-sm font-semibold text-slate-900">
            {user.name ?? user.username}
          </p>
          <p className="text-xs text-slate-500">@{user.username}</p>
          <p className="mt-1 text-xs text-slate-500">
            {followerCount} followers · {followingCount} following
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleToggleFollow}
        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
}
