"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

export default function SignUpForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn("password", {
        email,
        password,
        flow: "signUp",
        username,
      });
      router.push("/");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to sign up.",
      );
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
        <label className="text-sm font-semibold text-slate-700" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
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
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-semibold text-sky-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
