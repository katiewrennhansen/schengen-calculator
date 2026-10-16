import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import type { TripInput } from "../../types.ts";
import { TripRow } from "./TripRow.tsx";

describe("TripRow", () => {
  it("renders the entry and exit date fields for a trip", () => {
    function Wrapper() {
      const form = useForm<{ trips: TripInput[] }>({
        defaultValues: {
          trips: [{ id: "trip-1", entry: "", exit: "" }],
        },
      });

      return (
        <TripRow
          index={0}
          trip={form.getValues("trips")[0]}
          control={form.control}
          onRemove={() => {}}
        />
      );
    }

    render(<Wrapper />);

    expect(
      screen.getAllByLabelText(/date of entry, stay 1/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByLabelText(/date of exit, stay 1/i).length,
    ).toBeGreaterThan(0);
  });
});
