import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Mini Twitter",
  description: "Sign in or create an account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
