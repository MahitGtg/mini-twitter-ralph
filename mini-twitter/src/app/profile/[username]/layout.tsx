import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Mini Twitter",
  description: "View user profile and tweets",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
