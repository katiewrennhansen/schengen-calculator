import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Summary } from "./Summary.tsx";

describe("Summary", () => {
  it("renders the allowance summary and alert", () => {
    render(
      <Summary
        result={{
          plan: {
            referenceDate: "2025-01-15",
            windowStart: "2024-07-18",
            daysUsed: 25,
            daysRemaining: 65,
            nextEntry: "2025-01-16",
            nextLastDay: "2025-02-10",
            nextMaxDays: 25,
          },
          trips: [
            {
              id: "trip-1",
              entry: "2024-12-01",
              exit: "2024-12-10",
              daysOfStay: 10,
              daysInLast180: 10,
              lastDayToStay: "2024-12-20",
              maxStayDays: 10,
              overstay: false,
              excessDays: 0,
              firstOverstayDate: null,
            },
          ],
        }}
        referenceDate="2025-01-15"
        onReferenceDateChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /your allowance/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/days used/i)).toBeInTheDocument();
    expect(screen.getByText(/no overstays/i)).toBeInTheDocument();
  });
});
