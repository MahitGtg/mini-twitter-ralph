import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

function normalizeEmail(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeUsername(value: unknown, fallbackEmail: string) {
  const cleaned = String(value ?? "")
    .trim()
    .toLowerCase();
  if (cleaned) {
    return cleaned;
  }
  const [prefix] = fallbackEmail.split("@");
  return prefix ?? "";
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = normalizeEmail(params.email);
        if (!email) {
          throw new Error("Email is required");
        }
        const username = normalizeUsername(params.username, email);
        if (!username) {
          throw new Error("Username is required");
        }
        const avatarUrl = String(params.avatarUrl ?? "").trim();
        return {
          email,
          name: String(params.name ?? username),
          image: avatarUrl || null,
          username,
          bio: String(params.bio ?? ""),
          avatarUrl,
          createdAt: Date.now(),
        };
      },
    }),
  ],
});
