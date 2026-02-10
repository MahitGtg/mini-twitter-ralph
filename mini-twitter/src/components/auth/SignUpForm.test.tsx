import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import SignUpForm from "./SignUpForm";

const mockUseAuthActions = useAuthActions as unknown as vi.Mock;
const mockUseRouter = useRouter as unknown as vi.Mock;

describe("SignUpForm", () => {
  it("validates password confirmation", async () => {
    const signIn = vi.fn();
    mockUseAuthActions.mockReturnValue({ signIn });
    mockUseRouter.mockReturnValue({ push: vi.fn() });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "alex" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("submits sign up data and navigates on success", async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    const push = vi.fn();
    mockUseAuthActions.mockReturnValue({ signIn });
    mockUseRouter.mockReturnValue({ push });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "alex" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith("password", {
        email: "alex@example.com",
        password: "secret",
        flow: "signUp",
        username: "alex",
      }),
    );
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows an error when sign up fails", async () => {
    const signIn = vi.fn().mockRejectedValue(new Error("Nope"));
    mockUseAuthActions.mockReturnValue({ signIn });
    mockUseRouter.mockReturnValue({ push: vi.fn() });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "alex" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(screen.getByText("Nope")).toBeInTheDocument());
  });
});
