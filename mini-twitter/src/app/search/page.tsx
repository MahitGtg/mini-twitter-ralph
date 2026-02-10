"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MainLayout from "@/components/layout/MainLayout";
import TweetCard from "@/components/tweets/TweetCard";
import TweetSkeleton from "@/components/tweets/TweetSkeleton";
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

function formatCountLabel(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"} found`;
}

type EmptyStateProps = {
  icon: string;
  title: string;
  description: ReactNode;
  helper: string;
};

function EmptyState({ icon, title, description, helper }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div
        aria-hidden="true"
        className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg"
      >
        {icon}
      </div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </section>
  );
}

export default function SearchPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchMode, setSearchMode] = useState<"users" | "tweets">("users");
  const debouncedSearch = useDebounce(searchInput, 300);
  const currentUser = useQuery(api.users.getCurrentUser);
  const isUsersMode = searchMode === "users";
  const isTweetsMode = searchMode === "tweets";

  const userResults = useQuery(
    api.users.searchUsers,
    isUsersMode && debouncedSearch ? { query: debouncedSearch } : "skip",
  );
  const tweetResults = useQuery(
    api.tweets.searchTweets,
    isTweetsMode && debouncedSearch ? { query: debouncedSearch } : "skip",
  );

  return (
    <MainLayout rightRail={<WhoToFollow />}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">Search</h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Find people or scan through recent tweets.
            </p>
            <div className="flex w-full rounded-full border border-slate-200 bg-white p-1 text-xs font-medium text-slate-600 shadow-sm sm:w-auto">
              <button
                type="button"
                onClick={() => setSearchMode("users")}
                className={`flex-1 rounded-full px-4 py-2 text-sm transition sm:flex-none ${
                  isUsersMode
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Users
              </button>
              <button
                type="button"
                onClick={() => setSearchMode("tweets")}
                className={`flex-1 rounded-full px-4 py-2 text-sm transition sm:flex-none ${
                  isTweetsMode
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tweets
              </button>
            </div>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={
              isTweetsMode
                ? "Search tweets..."
                : "Search by username or name..."
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {!debouncedSearch ? (
          <p className="text-sm text-slate-500">
            {isTweetsMode
              ? "Type to search recent tweets by content."
              : "Start typing to discover new people to follow."}
          </p>
        ) : isUsersMode ? (
          userResults === undefined ? (
            <SearchSkeleton />
          ) : userResults.length === 0 ? (
            <EmptyState
              icon="?"
              title="No users found"
              description={
                <>
                  No results for{" "}
                  <span className="font-medium text-slate-700">
                    &quot;{debouncedSearch}&quot;
                  </span>
                  .
                </>
              }
              helper="Check the spelling or try a different username or name."
            />
          ) : (
            <section>
              <h2 className="mb-4 text-sm font-medium text-slate-500">
                {formatCountLabel(userResults.length, "user")}
              </h2>
              <div className="space-y-3">
                {userResults.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    currentUserId={currentUser?._id}
                  />
                ))}
              </div>
            </section>
          )
        ) : tweetResults === undefined ? (
          <div className="space-y-3">
            <TweetSkeleton />
            <TweetSkeleton />
            <TweetSkeleton />
          </div>
        ) : tweetResults.length === 0 ? (
          <EmptyState
            icon="#"
            title="No tweets found"
            description={
              <>
                Nothing matched{" "}
                <span className="font-medium text-slate-700">
                  &quot;{debouncedSearch}&quot;
                </span>
                .
              </>
            }
            helper="Try a different phrase or check spelling."
          />
        ) : (
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-slate-500">
              {formatCountLabel(tweetResults.length, "tweet")}
            </h2>
            <div className="space-y-4">
              {tweetResults.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  author={tweet.author ?? null}
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
