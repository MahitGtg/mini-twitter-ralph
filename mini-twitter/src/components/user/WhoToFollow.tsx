"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UserCard from "@/components/user/UserCard";

export default function WhoToFollow() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const suggestions = useQuery(api.users.getSuggestedUsers, { limit: 3 });

  if (suggestions === undefined) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-12 rounded bg-slate-100" />
          <div className="h-12 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Who to follow</h3>
      <div className="space-y-3">
        {suggestions.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            currentUserId={currentUser?._id}
            compact
          />
        ))}
      </div>
    </div>
  );
}
