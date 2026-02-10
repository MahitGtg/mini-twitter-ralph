"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import UserCard from "@/components/user/UserCard";
import WhoToFollow from "@/components/user/WhoToFollow";
import { useDebounce } from "@/hooks/useDebounce";

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-16 rounded-2xl border border-slate-200 bg-white shadow-sm" />
      <div className="h-16 rounded-2xl border border-slate-200 bg-white shadow-sm" />
      <div className="h-16 rounded-2xl border border-slate-200 bg-white shadow-sm" />
    </div>
  );
}

export default function SearchPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const currentUser = useQuery(api.users.getCurrentUser);

  const searchResults = useQuery(
    api.users.searchUsers,
    debouncedSearch ? { query: debouncedSearch } : "skip",
  );

  return (
    <MainLayout rightRail={<WhoToFollow />}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">Search Users</h1>
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by username or name..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {!debouncedSearch ? (
          <p className="text-sm text-slate-500">
            Start typing to discover new people to follow.
          </p>
        ) : searchResults === undefined ? (
          <SearchSkeleton />
        ) : searchResults.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div
              aria-hidden="true"
              className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg"
            >
              ?
            </div>
            <h2 className="text-base font-semibold text-slate-900">No users found</h2>
            <p className="mt-2 text-sm text-slate-500">
              No results for <span className="font-medium text-slate-700">"{debouncedSearch}"</span>.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Check the spelling or try a different username or name.
            </p>
          </section>
        ) : (
          <section>
            <h2 className="mb-4 text-sm font-medium text-slate-500">
              {searchResults.length} user{searchResults.length === 1 ? "" : "s"} found
            </h2>
            <div className="space-y-3">
              {searchResults.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  currentUserId={currentUser?._id}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
