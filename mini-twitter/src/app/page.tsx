"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import SignInForm from "@/components/auth/SignInForm";
import TweetComposer from "@/components/tweets/TweetComposer";
import TweetFeed from "@/components/tweets/TweetFeed";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";

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
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome to Mini Twitter
          </h1>
          <p className="text-sm text-slate-600">
            Sign in to post updates and see your personalized feed.
          </p>
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
    <MainLayout>
      <TweetComposer />
      <TweetFeed currentUserId={currentUser?._id} />
    </MainLayout>
  );
}
