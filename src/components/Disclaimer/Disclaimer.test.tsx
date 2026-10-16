import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Disclaimer } from "./Disclaimer.tsx";

describe("Disclaimer", () => {
  it("renders the Schengen planning disclaimer", () => {
    render(<Disclaimer />);

    expect(
      screen.getByText(/this calculator is a planning aid only/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/regulation \(eu\) 2016\/399/i),
    ).toBeInTheDocument();
  });
});
