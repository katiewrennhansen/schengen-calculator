import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverstayAlert } from "./OverstayAlert.tsx";
import { createTestTrip } from "../../test/testUtils.ts";

describe("OverstayAlert", () => {
  it("renders the success state when no trips overstay", () => {
    render(<OverstayAlert trips={[createTestTrip({ overstay: false })]} />);

    expect(screen.getByText(/no overstays/i)).toBeInTheDocument();
    expect(
      screen.getByText(/every stay you entered stays within the 90\/180 rule/i),
    ).toBeInTheDocument();
  });

  it("renders the danger state when at least one trip over stays", () => {
    render(
      <OverstayAlert
        trips={[
          createTestTrip({
            overstay: true,
            daysOfStay: 95,
            daysInLast180: 95,
          }),
        ]}
      />,
    );

    expect(screen.getByText(/overstay on 1 stay/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /at least one stay goes over 90 days within a 180-day period/i,
      ),
    ).toBeInTheDocument();
  });
});
