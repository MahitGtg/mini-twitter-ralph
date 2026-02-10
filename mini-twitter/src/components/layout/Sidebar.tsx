"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AuthButton from "@/components/auth/AuthButton";
import UserAvatar from "@/components/user/UserAvatar";

type SidebarProps = {
  variant?: "desktop" | "mobile";
};

export default function Sidebar({ variant = "desktop" }: SidebarProps) {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const profileHref = user?.username ? `/profile/${user.username}` : null;

  if (variant === "mobile") {
    const navItems = [
      { href: "/", label: "Home", as: "link" },
      { href: "/search", label: "Search", as: "link" },
      ...(profileHref ? [{ href: profileHref, label: "Profile", as: "link" }] : []),
      { href: "#compose", label: "Tweet", as: "anchor" },
    ] as const;

    return (
      <aside className="flex flex-col gap-2">
        <nav
          className={`grid gap-2 text-xs text-slate-700 ${
            navItems.length === 4 ? "grid-cols-4" : "grid-cols-3"
          }`}
        >
          {navItems.map((item) =>
            item.as === "link" ? (
              <Link
                key={item.label}
                href={item.href}
                className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 font-medium transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 font-medium transition hover:bg-slate-100"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
        <div className="flex items-center justify-center">
          <AuthButton />
        </div>
      </aside>
    );
  }

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
          <Link
            href="/search"
            className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Search
          </Link>
          {profileHref ? (
            <Link
              href={profileHref}
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
              href={profileHref ?? undefined}
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
