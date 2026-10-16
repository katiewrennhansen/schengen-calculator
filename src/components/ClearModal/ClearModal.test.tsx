import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClearModal } from "./ClearModal.tsx";

describe("ClearModal", () => {
  it("renders the reset warning and confirms the clear action", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    const { unmount } = render(
      <ClearModal
        isOpen={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/clear all dates\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /this removes every stay you entered and clears your results/i,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    unmount();
  });
});
