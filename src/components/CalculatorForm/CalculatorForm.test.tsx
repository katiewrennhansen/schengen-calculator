import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalculatorForm } from "./CalculatorForm.tsx";

describe("CalculatorForm", () => {
  it("renders the form controls and calculate action", () => {
    const onCalculate = vi.fn();
    const onReset = vi.fn();

    render(
      <CalculatorForm
        trips={[]}
        errors={{}}
        result={null}
        onCalculate={onCalculate}
        onReset={onReset}
      />,
    );

    expect(
      screen.getByRole("button", { name: /add stay/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /calculate/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });
});
