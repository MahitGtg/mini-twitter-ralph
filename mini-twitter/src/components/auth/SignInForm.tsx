"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

function getFriendlySignInError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to sign in.";
  }

  const message = error.message.toLowerCase();
  if (
    message.includes("invalidsecret") ||
    message.includes("invalid password") ||
    message.includes("invalid credentials") ||
    message.includes("bad credentials")
  ) {
    return "Invalid email or password.";
  }

  return "Unable to sign in.";
}

export default function SignInForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      router.push("/");
    } catch (error) {
      setStatus(getFriendlySignInError(error));
    } finally {
      setIsSubmitting(false);
    }
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
          onChange={(event) => setEmail(event.target.value)}
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
          onChange={(event) => setPassword(event.target.value)}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
        />
      </div>
      {status ? <p className="text-sm text-rose-500">{status}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-xs text-slate-500">
        New here?{" "}
        <Link href="/auth/signup" className="font-semibold text-sky-600">
          Create an account
        </Link>
      </p>
    </form>
  );
}
