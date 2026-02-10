"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";

const MIN_PASSWORD_LENGTH = 6;

function getFriendlySignUpError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to sign up.";
  }

  const message = error.message.toLowerCase();
  if (
    message.includes("duplicate") ||
    message.includes("already exists") ||
    message.includes("already taken")
  ) {
    return "An account with that email or username already exists.";
  }
  if (
    message.includes("invalidsecret") ||
    (message.includes("password") &&
      (message.includes("least") ||
        message.includes("short") ||
        message.includes("length")))
  ) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return error.message;
}

export default function SignUpForm() {
  const router = useRouter();
  const convex = useConvex();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();
    const nextFieldErrors = {
      email: normalizedEmail ? "" : "Email is required.",
      username: normalizedUsername ? "" : "Username is required.",
      password: password ? "" : "Password is required.",
      confirmPassword: confirmPassword ? "" : "Please confirm your password.",
    };

    if (password && password.length < MIN_PASSWORD_LENGTH) {
      nextFieldErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      nextFieldErrors.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(nextFieldErrors);

    if (Object.values(nextFieldErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    try {
      try {
        const [existingByEmail, existingByUsername] = await Promise.all([
          convex.query(api.users.getUserByEmail, {
            email: normalizedEmail,
          }),
          convex.query(api.users.getUserByUsername, {
            username: normalizedUsername,
          }),
        ]);

        if (existingByEmail || existingByUsername) {
          setStatus("An account with that email or username already exists.");
          return;
        }
      } catch {
        // Ignore preflight issues and let auth provider return a typed error.
      }

      await signIn("password", {
        email: normalizedEmail,
        password,
        flow: "signUp",
        username: normalizedUsername,
      });
      router.push("/");
    } catch (error) {
      setStatus(getFriendlySignUpError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
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
            setFieldErrors((prev) => ({ ...prev, email: "" }));
          }}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
        />
        {fieldErrors.email ? <p className="text-xs text-rose-500">{fieldErrors.email}</p> : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setFieldErrors((prev) => ({ ...prev, username: "" }));
          }}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
        />
        {fieldErrors.username ? (
          <p className="text-xs text-rose-500">{fieldErrors.username}</p>
        ) : null}
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
            setFieldErrors((prev) => ({ ...prev, password: "" }));
          }}
          minLength={MIN_PASSWORD_LENGTH}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
        />
        <p className="text-xs text-slate-500">
          Use at least {MIN_PASSWORD_LENGTH} characters.
        </p>
        {fieldErrors.password ? (
          <p className="text-xs text-rose-500">{fieldErrors.password}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          minLength={MIN_PASSWORD_LENGTH}
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-400 focus:outline-none"
        />
        {fieldErrors.confirmPassword ? (
          <p className="text-xs text-rose-500">{fieldErrors.confirmPassword}</p>
        ) : null}
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
