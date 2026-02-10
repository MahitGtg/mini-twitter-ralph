import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useMutation } from "convex/react";
import TweetComposer from "./TweetComposer";

const mockUseMutation = useMutation as unknown as vi.Mock;

describe("TweetComposer", () => {
  it("renders textarea and submit button with count", () => {
    mockUseMutation.mockReturnValue(vi.fn());

    render(<TweetComposer />);

    expect(
      screen.getByPlaceholderText("What's happening?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tweet" })).toBeDisabled();
    expect(screen.getByText("300 characters remaining")).toBeInTheDocument();
  });

  it("disables submit when content exceeds limit", () => {
    mockUseMutation.mockReturnValue(vi.fn());

    render(<TweetComposer />);

    const textarea = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(textarea, { target: { value: "a".repeat(301) } });

    expect(screen.getByRole("button", { name: "Tweet" })).toBeDisabled();
    expect(screen.getByText("-1 characters remaining")).toBeInTheDocument();
  });

  it("submits a tweet and clears the input", async () => {
    const createTweet = vi.fn().mockResolvedValue("tweet-id");
    mockUseMutation.mockReturnValue(createTweet);

    render(<TweetComposer />);

    const textarea = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    fireEvent.click(screen.getByRole("button", { name: "Tweet" }));

    await waitFor(() =>
      expect(createTweet).toHaveBeenCalledWith({ content: "Hello world" }),
    );
    expect(textarea).toHaveValue("");
    expect(screen.getByText("Tweet posted!")).toBeInTheDocument();
  });

  it("shows an error message when submission fails", async () => {
    const createTweet = vi.fn().mockRejectedValue(new Error("Nope"));
    mockUseMutation.mockReturnValue(createTweet);

    render(<TweetComposer />);

    const textarea = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    fireEvent.click(screen.getByRole("button", { name: "Tweet" }));

    await waitFor(() => expect(screen.getByText("Nope")).toBeInTheDocument());
  });
});
