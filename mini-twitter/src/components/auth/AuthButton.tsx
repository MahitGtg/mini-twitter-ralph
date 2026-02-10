"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AuthButton() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);

  if (isLoading) {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />;
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/signin"
        className="w-full rounded-full bg-sky-500 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-sky-600 sm:w-auto"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      <span className="max-w-[160px] truncate text-sm font-semibold text-slate-700">
        {user?.username ?? "Account"}
      </span>
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300"
      >
        Sign out
      </button>
    </div>
  );
}
