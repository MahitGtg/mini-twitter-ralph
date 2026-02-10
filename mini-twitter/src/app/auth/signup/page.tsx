"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (!isLoading && isAuthenticated) {
    redirect("/");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-md text-center text-sm text-slate-600">
          Checking your session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Create your account
          </h1>
          <p className="text-sm text-slate-600">
            Join Mini Twitter and start sharing your thoughts.
          </p>
        </header>
        <SignUpForm />
      </div>
    </div>
  );
}
