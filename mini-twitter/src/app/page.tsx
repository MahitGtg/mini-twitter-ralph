"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import SignInForm from "@/components/auth/SignInForm";
import TweetComposer from "@/components/tweets/TweetComposer";
import TweetFeed from "@/components/tweets/TweetFeed";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";
import WhoToFollow from "@/components/user/WhoToFollow";

function LoadingState() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <TweetSkeleton />
        <TweetSkeleton />
        <TweetSkeleton />
      </div>
    </MainLayout>
  );
}

function SignInPrompt() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome to Mini Twitter
          </h1>
          <p className="text-sm text-slate-600">
            Sign in to post updates and unlock your personalized feed.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/signin"
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Create account
            </Link>
          </div>
        </header>
        <SignInForm />
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <SignInPrompt />;
  }

  return (
    <MainLayout rightRail={<WhoToFollow />}>
      <TweetComposer />
      <TweetFeed currentUserId={currentUser?._id} />
    </MainLayout>
  );
}
