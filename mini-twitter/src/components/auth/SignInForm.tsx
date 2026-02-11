"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import RetryableError from "@/components/ui/RetryableError";
import { getRetryableAuthError } from "@/components/auth/authErrorUtils";
import { useToast } from "@/hooks/useToast";

function getFriendlySignInError(error: unknown) {
  let message = "";
  if (error instanceof Error) {
    message = error.message.toLowerCase();
  } else if (typeof error === "string") {
    message = error.toLowerCase();
  } else {
    try {
      message = JSON.stringify(error)?.toLowerCase() ?? "";
    } catch {
      message = "";
    }
  }
  if (
    message.includes("invalidsecret") ||
    message.includes("invalid password") ||
    message.includes("invalid credentials") ||
    message.includes("bad credentials") ||
    message.includes("not found") ||
    message.includes("user not found") ||
    message.includes("no user") ||
    message.includes("unable to sign in")
  ) {
    return "Invalid email or password.";
  }

  return message.trim() ? "Invalid email or password." : "Unable to sign in.";
}

function getSignInFailureFromResult(result: unknown) {
  if (!result || typeof result !== "object") {
    return "";
  }

  const response = result as Record<string, unknown>;
  const rawError =
    response.error ??
    response.message ??
    (typeof response.details === "object" && response.details
      ? (response.details as Record<string, unknown>).message
      : undefined);

  if (typeof rawError === "string" && rawError.trim()) {
    return getFriendlySignInError(new Error(rawError));
  }
  if (rawError instanceof Error) {
    return getFriendlySignInError(rawError);
  }
  if (response.success === false) {
    return "Invalid email or password.";
  }

  return "";
}

export default function SignInForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [retryError, setRetryError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const clearRetryError = () => {
    if (retryError) {
      setRetryError(null);
    }
  };

  const attemptSignIn = async () => {
    setStatus("");
    setRetryError(null);
    setIsSubmitting(true);
    try {
      const response = await signIn("password", { email, password, flow: "signIn" });
      const failure = getSignInFailureFromResult(response);
      if (failure) {
        setStatus(failure);
        return;
      }
      router.push("/");
    } catch (error) {
      const retryableError = getRetryableAuthError(error);
      if (retryableError) {
        setRetryError(retryableError);
        toast.error("Network error. Please try again.");
      } else {
        setStatus(getFriendlySignInError(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await attemptSignIn();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearRetryError();
          }}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearRetryError();
          }}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
        />
      </div>
      <p
        aria-live="polite"
        className={`min-h-5 text-sm ${status ? "text-rose-500" : "text-transparent"}`}
      >
        {status || " "}
      </p>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      {retryError ? (
        <RetryableError
          error={retryError}
          onRetry={attemptSignIn}
          retryLabel="Retry sign in"
          variant="inline"
        />
      ) : null}
      <p className="text-center text-xs text-slate-500">
        New here?{" "}
        <Link href="/auth/signup" className="font-semibold text-sky-600">
          Create an account
        </Link>
      </p>
    </form>
  );
}
