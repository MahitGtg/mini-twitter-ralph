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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() || remaining < 0) {
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
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-400 focus:outline-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>{remaining} characters remaining</span>
          {status ? <span>{status}</span> : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || remaining < 0}
          className="justify-self-end rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Posting..." : "Tweet"}
        </button>
      </form>
    </section>
  );
}
