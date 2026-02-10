import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
  useConvex: vi.fn(),
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: vi.fn(() => ({
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});
