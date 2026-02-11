import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "@/test/convexTestSetup";

const createUser = async (
  t: ReturnType<typeof convexTest>,
  {
    email,
    username,
    name,
    bio = "",
    avatarUrl = "",
  }: {
    email: string;
    username: string;
    name?: string;
    bio?: string;
    avatarUrl?: string;
  },
) =>
  t.run((ctx) =>
    ctx.db.insert("users", {
      email,
      username,
      name,
      bio,
      avatarUrl,
      createdAt: Date.now(),
    }),
  );

describe("users", () => {
  it("returns null for getCurrentUser when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    const current = await t.query(api.users.getCurrentUser, {});

    expect(current).toBeNull();
  });

  it("returns current user when authenticated", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, {
      email: "alex@example.com",
      username: "alex",
    });
    const asUser = t.withIdentity({ subject: userId });

    const current = await asUser.query(api.users.getCurrentUser, {});

    expect(current?._id).toBe(userId);
  });

  it("returns users by id and username", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, {
      email: "alex@example.com",
      username: "alex",
    });

    const byId = await t.query(api.users.getUserById, { userId });
    const byUsername = await t.query(api.users.getUserByUsername, {
      username: "  Alex  ",
    });

    expect(byId?._id).toBe(userId);
    expect(byUsername?._id).toBe(userId);
  });

  it("rejects updateProfile when unauthenticated", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.mutation(api.users.updateProfile, { bio: "New" }),
    ).rejects.toThrowError("Not authenticated");
  });

  it("rejects duplicate usernames", async () => {
    const t = convexTest(schema, modules);
    await createUser(t, {
      email: "alex@example.com",
      username: "alex",
    });
    const userId = await createUser(t, {
      email: "other@example.com",
      username: "other",
    });
    const asUser = t.withIdentity({ subject: userId });

    await expect(
      asUser.mutation(api.users.updateProfile, { username: "alex" }),
    ).rejects.toThrowError("Username is already taken");
  });

  it("updates profile fields", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, {
      email: "alex@example.com",
      username: "alex",
    });
    const asUser = t.withIdentity({ subject: userId });

    const updated = await asUser.mutation(api.users.updateProfile, {
      bio: "Hello there",
      avatarUrl: "https://example.com/avatar.png",
    });

    expect(updated?.bio).toBe("Hello there");
    expect(updated?.avatarUrl).toBe("https://example.com/avatar.png");
    expect(updated?.image).toBe("https://example.com/avatar.png");
  });

  it("updates display name with trimming", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, {
      email: "alex@example.com",
      username: "alex",
      name: "Alex",
    });
    const asUser = t.withIdentity({ subject: userId });

    const updated = await asUser.mutation(api.users.updateProfile, {
      name: "  Alex Johnson  ",
    });

    expect(updated?.name).toBe("Alex Johnson");
  });

  it("allows clearing the display name", async () => {
    const t = convexTest(schema, modules);
    const userId = await createUser(t, {
      email: "alex@example.com",
      username: "alex",
      name: "Alex",
    });
    const asUser = t.withIdentity({ subject: userId });

    const updated = await asUser.mutation(api.users.updateProfile, { name: "" });

    expect(updated?.name).toBeUndefined();
  });
});
