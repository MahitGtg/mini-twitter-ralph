"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const MAX_LENGTH = 300;

export default function TweetComposer() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTweet = useMutation(api.tweets.createTweet);

  const remaining = MAX_LENGTH - content.length;
  const isOverLimit = remaining < 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() || isOverLimit) {
      return;
    }
    setStatus("");
    setIsSubmitting(true);
    try {
      await createTweet({ content });
      setContent("");
      setStatus("Tweet posted!");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to post tweet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="compose"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Compose</h2>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          maxLength={MAX_LENGTH + 10}
          placeholder="What's happening?"
          className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 focus:outline-none ${
            isOverLimit
              ? "border-rose-300 focus:border-rose-400"
              : "border-slate-200 focus:border-sky-400"
          }`}
        />
        <div className="grid min-h-8 grid-cols-[1fr_auto] items-center gap-2">
          <span
            className={`text-sm font-medium ${
              isOverLimit ? "text-rose-600" : "text-slate-500"
            }`}
          >
            {remaining} characters remaining
          </span>
          <div className="min-h-6 text-right">
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
          disabled={isSubmitting || !content.trim() || isOverLimit}
          className="justify-self-end rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Posting..." : "Tweet"}
        </button>
      </form>
    </section>
  );
}
