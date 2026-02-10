"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type RetryableErrorProps = {
  error?: unknown;
  message?: string;
  onRetry?: () => Promise<void> | void;
  retryLabel?: string;
  isRetrying?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  baseDelayMs?: number;
  variant?: "card" | "inline";
  className?: string;
};

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";
const DEFAULT_RETRY_LABEL = "Try again";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 800;

function getErrorMessage(error: unknown, message?: string) {
  if (message && message.trim()) {
    return message.trim();
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }
  return DEFAULT_MESSAGE;
}

export default function RetryableError({
  error,
  message,
  onRetry,
  retryLabel = DEFAULT_RETRY_LABEL,
  isRetrying,
  autoRetry = false,
  maxRetries = DEFAULT_MAX_RETRIES,
  baseDelayMs = DEFAULT_BASE_DELAY_MS,
  variant = "card",
  className = "",
}: RetryableErrorProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetryingInternal, setIsRetryingInternal] = useState(false);
  const resolvedIsRetrying = isRetrying ?? isRetryingInternal;
  const hasError = Boolean(error || message);
  const resolvedMessage = useMemo(
    () => getErrorMessage(error, message),
    [error, message],
  );

  const handleRetry = useCallback(async () => {
    if (!onRetry || resolvedIsRetrying) {
      return;
    }
    setIsRetryingInternal(true);
    try {
      await onRetry();
    } catch {
      // Keep the existing error visible if retry fails.
    } finally {
      setIsRetryingInternal(false);
    }
  }, [onRetry, resolvedIsRetrying]);

  useEffect(() => {
    if (!hasError) {
      setRetryCount(0);
      return;
    }
    setRetryCount(0);
  }, [hasError, resolvedMessage]);

  useEffect(() => {
    if (!autoRetry || !onRetry || !hasError || retryCount >= maxRetries) {
      return;
    }
    const delay = baseDelayMs * Math.pow(2, retryCount);
    const timeout = window.setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      void handleRetry();
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [autoRetry, onRetry, hasError, retryCount, maxRetries, baseDelayMs, handleRetry]);

  if (!hasError) {
    return null;
  }

  const containerClass =
    variant === "inline"
      ? "flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
      : "rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm";
  const buttonClass =
    variant === "inline"
      ? "rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      : "rounded-full border border-rose-300 px-4 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-400 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className={`${containerClass} ${className}`.trim()}>
      <span
        aria-hidden
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-200 text-[11px] font-bold text-rose-700"
      >
        !
      </span>
      <span className="flex-1">{resolvedMessage}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={handleRetry}
          disabled={resolvedIsRetrying}
          className={buttonClass}
        >
          {resolvedIsRetrying ? "Retrying..." : retryLabel}
        </button>
      ) : null}
    </div>
  );
}
