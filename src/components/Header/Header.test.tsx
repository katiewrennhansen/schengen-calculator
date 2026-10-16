import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header.tsx";

describe("Header", () => {
  it("renders the banner heading and supporting text", () => {
    render(<Header />);

    expect(
      screen.getByRole("heading", { name: /schengen visa calculator/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/travel planner/i)).toBeInTheDocument();
  });

  it("renders the call to action button", () => {
    render(<Header />);

    expect(
      screen.getByRole("button", { name: /calculate now/i }),
    ).toBeInTheDocument();
  });
});
