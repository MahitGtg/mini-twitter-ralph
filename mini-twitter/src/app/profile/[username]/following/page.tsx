"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import UserCard from "@/components/user/UserCard";

export default function FollowingPage() {
  const params = useParams<{ username?: string | string[] }>();
  const rawUsername = params?.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  const profileUser = useQuery(
    api.users.getUserByUsername,
    username ? { username } : "skip",
  );
  const currentUser = useQuery(api.users.getCurrentUser);
  const following = useQuery(
    api.social.getFollowingWithUsers,
    profileUser?._id ? { userId: profileUser._id } : "skip",
  );

  if (!username || profileUser === null) {
    return (
      <MainLayout>
        <div className="text-center text-slate-500">User not found</div>
      </MainLayout>
    );
  }

  if (profileUser === undefined || following === undefined) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <Link
            href={`/profile/${username}`}
            className="inline-flex text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">
            @{username}&apos;s Following
          </h1>
        </div>

        {following.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Not following anyone yet.
          </div>
        ) : (
          <div className="space-y-3">
            {following.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                currentUserId={currentUser?._id}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
