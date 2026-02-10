import { useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 20;

type FeedType = "home" | "user" | "likes";

export function usePaginatedFeed(feedType: FeedType, userId?: Id<"users">) {
  const queryFn =
    feedType === "home"
      ? api.tweets.getFeedPaginated
      : feedType === "user"
        ? api.tweets.getUserTweetsPaginated
        : api.likes.getLikedTweetsPaginated;

  const shouldSkip = feedType !== "home" && !userId;
  const args = feedType === "home" ? {} : { userId } as { userId: Id<"users"> };

  const { results, status, loadMore } = usePaginatedQuery(
    queryFn,
    shouldSkip ? "skip" : args,
    {
      initialNumItems: PAGE_SIZE,
    },
  );

  const handleLoadMore = useCallback(() => {
    loadMore(PAGE_SIZE);
  }, [loadMore]);

  if (shouldSkip) {
    return {
      tweets: [],
      isLoading: false,
      isLoadingMore: false,
      canLoadMore: false,
      isExhausted: true,
      loadMore: () => {},
    };
  }

  return {
    tweets: results ?? [],
    isLoading: status === "LoadingFirstPage",
    isLoadingMore: status === "LoadingMore",
    canLoadMore: status === "CanLoadMore",
    isExhausted: status === "Exhausted",
    loadMore: handleLoadMore,
  };
}
