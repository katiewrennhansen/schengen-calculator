import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Calculator } from "./Calculator.tsx";

describe("Calculator", () => {
  it("renders the calculator shell and action controls", () => {
    render(<Calculator />);

    expect(
      screen.getByText(/important information about schengen visa rules/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /calculate/i }),
    ).toBeInTheDocument();
  });
});
