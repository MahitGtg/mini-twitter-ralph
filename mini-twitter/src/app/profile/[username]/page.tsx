"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import ProfileHeader from "@/components/user/ProfileHeader";
import TweetFeed from "@/components/tweets/TweetFeed";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";

function ProfileSkeleton() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-200" />
            <div className="space-y-3">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 w-48 rounded bg-slate-200" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <TweetSkeleton />
          <TweetSkeleton />
        </div>
      </div>
    </MainLayout>
  );
}

function NotFoundState({ username }: { username: string }) {
  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900">User not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The user @{username} doesn&apos;t exist or may have been deleted.
        </p>
      </div>
    </MainLayout>
  );
}

export default function ProfilePage() {
  const params = useParams<{ username?: string | string[] }>();
  const rawUsername = params?.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  const profileUser = useQuery(
    api.users.getUserByUsername,
    username ? { username } : "skip",
  );
  const currentUser = useQuery(api.users.getCurrentUser);

  if (!username) {
    return <NotFoundState username="unknown" />;
  }

  if (profileUser === undefined) {
    return <ProfileSkeleton />;
  }

  if (profileUser === null) {
    return <NotFoundState username={username} />;
  }

  const isCurrentUser = currentUser?._id === profileUser._id;

  return (
    <MainLayout>
      <div className="space-y-6">
        <ProfileHeader user={profileUser} isCurrentUser={isCurrentUser} />
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Tweets</h2>
          <TweetFeed
            userId={profileUser._id}
            currentUserId={currentUser?._id}
          />
        </section>
      </div>
    </MainLayout>
  );
}
