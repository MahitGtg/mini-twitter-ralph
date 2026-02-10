import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import SignInForm from "./SignInForm";

const mockUseAuthActions = useAuthActions as unknown as vi.Mock;
const mockUseRouter = useRouter as unknown as vi.Mock;

describe("SignInForm", () => {
  it("submits credentials and navigates on success", async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    const push = vi.fn();
    mockUseAuthActions.mockReturnValue({ signIn });
    mockUseRouter.mockReturnValue({ push });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith("password", {
        email: "alex@example.com",
        password: "secret",
        flow: "signIn",
      }),
    );
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows a loading state while submitting", async () => {
    const signIn = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 0)),
    );
    mockUseAuthActions.mockReturnValue({ signIn });
    mockUseRouter.mockReturnValue({ push: vi.fn() });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      screen.getByRole("button", { name: "Signing in..." }),
    ).toBeDisabled();
  });

  it("shows an error when sign in fails", async () => {
    const signIn = vi.fn().mockRejectedValue(new Error("Bad credentials"));
    mockUseAuthActions.mockReturnValue({ signIn });
    mockUseRouter.mockReturnValue({ push: vi.fn() });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(
        screen.getByText("Invalid email or password."),
      ).toBeInTheDocument(),
    );
  });
});
