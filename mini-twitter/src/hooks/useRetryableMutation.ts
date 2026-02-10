"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { FunctionReference } from "convex/server";

type RetryableMutationOptions = {
  autoRetry?: boolean;
  maxRetries?: number;
  baseDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
};

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BASE_DELAY_MS = 900;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const shouldRetryDefault = (error: unknown) => {
  if (!(error instanceof Error)) {
    return true;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("offline") ||
    message.includes("temporarily") ||
    message.includes("503") ||
    message.includes("504")
  );
};

export function useRetryableMutation<TArgs = Record<string, unknown>, TResult = unknown>(
  mutation: FunctionReference<"mutation">,
  options: RetryableMutationOptions = {},
) {
  const mutationFn = useMutation(mutation) as (args: TArgs) => Promise<TResult>;
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastArgsRef = useRef<TArgs | null>(null);

  const execute = useCallback(
    async (args: TArgs) => {
      lastArgsRef.current = args;
      setIsLoading(true);
      setError(null);
      const maxRetries =
        options.maxRetries ?? (options.autoRetry ? DEFAULT_MAX_RETRIES : 0);
      const baseDelayMs =
        options.baseDelayMs ?? (options.autoRetry ? DEFAULT_BASE_DELAY_MS : 0);
      const shouldRetry = options.shouldRetry ?? shouldRetryDefault;
      let attempt = 0;

      while (true) {
        try {
          const result = await mutationFn(args);
          setError(null);
          setIsLoading(false);
          return result;
        } catch (err) {
          const normalized =
            err instanceof Error ? err : new Error("Unable to complete request.");
          setError(normalized);
          if (!options.autoRetry || attempt >= maxRetries || !shouldRetry(err)) {
            setIsLoading(false);
            throw err;
          }
          const delay = baseDelayMs * Math.pow(2, attempt);
          attempt += 1;
          await sleep(delay);
        }
      }
    },
    [mutationFn, options],
  );

  const retry = useCallback(async () => {
    if (!lastArgsRef.current) {
      return;
    }
    await execute(lastArgsRef.current);
  }, [execute]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    retry,
    error,
    isLoading,
    clearError,
  };
}
