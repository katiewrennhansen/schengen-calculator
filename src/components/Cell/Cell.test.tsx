import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cell } from "./Cell.tsx";

describe("Cell", () => {
  it("renders the label and the cell content", () => {
    render(
      <Cell label="Days of stay">
        <span>12</span>
      </Cell>,
    );

    expect(screen.getByText("Days of stay")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
