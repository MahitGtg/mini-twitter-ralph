"use client";

import { useState } from "react";
import { api } from "@/convex/_generated/api";
import RetryableError from "@/components/ui/RetryableError";
import { useRetryableMutation } from "@/hooks/useRetryableMutation";
import { useToast } from "@/hooks/useToast";

const MAX_LENGTH = 300;

export default function TweetComposer() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const { execute, error, isLoading, retry, clearError } = useRetryableMutation(
    api.tweets.createTweet,
  );
  const { toast } = useToast();

  const remaining = MAX_LENGTH - content.length;
  const isOverLimit = remaining < 0;

  const submitTweet = async () => {
    if (!content.trim() || isOverLimit || isLoading) {
      return;
    }
    setStatus("");
    clearError();
    try {
      await execute({ content });
      setContent("");
      setStatus("Tweet posted!");
      toast.success("Tweet posted!");
    } catch {
      setStatus("");
      toast.error("Failed to post tweet.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitTweet();
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      await submitTweet();
      return;
    }

    if (event.key === "Escape" && content && !isLoading) {
      event.preventDefault();
      setContent("");
      setStatus("");
      clearError();
    }
  };

  return (
    <section
      id="compose"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">Compose</h2>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            if (error) {
              clearError();
            }
          }}
          onKeyDown={handleKeyDown}
          rows={4}
          maxLength={MAX_LENGTH + 10}
          placeholder="What's happening?"
          className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 focus:outline-none ${
            isOverLimit
              ? "border-rose-300 focus:border-rose-400"
              : "border-slate-200 focus:border-sky-400"
          }`}
        />
        <div className="grid min-h-8 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid gap-1">
            <span
              className={`text-sm font-medium ${
                isOverLimit ? "text-rose-600" : "text-slate-500"
              }`}
            >
              {remaining} characters remaining
            </span>
            <span className="text-xs text-slate-400">
              Ctrl+Enter or Cmd+Enter to tweet
            </span>
          </div>
          <div className="min-h-6 text-left sm:text-right">
            {isOverLimit ? (
              <p
                role="alert"
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700"
              >
                <span
                  aria-hidden
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-200 text-[10px] font-bold text-rose-700"
                >
                  !
                </span>
                Tweet cannot exceed 300 characters.
              </p>
            ) : status ? (
              <span className="inline-flex min-h-6 items-center text-xs text-slate-500">
                {status}
              </span>
            ) : (
              <span className="inline-flex min-h-6 items-center text-xs text-transparent">
                .
              </span>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !content.trim() || isOverLimit}
          className="w-full justify-self-stretch rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:justify-self-end"
        >
          {isLoading ? "Posting..." : "Tweet"}
        </button>
        <RetryableError
          error={error}
          onRetry={retry}
          retryLabel="Retry tweet"
          variant="inline"
        />
      </form>
    </section>
  );
}
