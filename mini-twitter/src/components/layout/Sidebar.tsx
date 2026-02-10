"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AuthButton from "@/components/auth/AuthButton";
import UserAvatar from "@/components/user/UserAvatar";

export default function Sidebar() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);

  return (
    <aside className="flex h-full flex-col justify-between gap-6 border-r border-slate-100 px-4 py-6">
      <div className="grid gap-4">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          Mini Twitter
        </Link>
        <nav className="grid gap-2 text-sm">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          {isAuthenticated && user?.username ? (
            <Link
              href={`/profile/${user.username}`}
              className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Profile
            </Link>
          ) : null}
          <a
            href="#compose"
            className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Tweet
          </a>
        </nav>
      </div>

      <div className="grid gap-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <UserAvatar
              username={user.username}
              name={user.name}
              avatarUrl={user.avatarUrl}
              href={`/profile/${user.username}`}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name ?? user.username}
              </p>
              <p className="truncate text-xs text-slate-500">@{user.username}</p>
            </div>
          </div>
        ) : null}
        <AuthButton />
      </div>
    </aside>
  );
}
