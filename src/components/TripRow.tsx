import { Button, Chip, DatePicker } from "@heroui/react";
import { type Control, Controller } from "react-hook-form";
import type { TripInput, TripResult } from "../utils/schengen.ts";
import { formatDate, plural } from "../utils/format.ts";
import { parseIsoDate, toIsoDate } from "../utils/dates.ts";
import { Cell } from "./Cell.tsx";
import { ROW_GRID } from "../constants.ts";
import { TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { motion } from "framer-motion";

type Props = {
  index: number;
  trip: TripInput;
  error?: { entry?: string; exit?: string };
  result?: TripResult;
  control: Control<{ trips: TripInput[] }>;
  onRemove: (id: string) => void;
};

export function TripRow({
  index,
  trip,
  error,
  result,
  control,
  onRemove,
}: Props) {
  const over = result?.overstay ?? false;
  const chipColor = result?.overstay
    ? "danger"
    : result && result.daysInLast180 >= 80
      ? "warning"
      : "success";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.98, y: 8 }}
      animate={{
        opacity: 1,
        height: "auto",
        scale: 1,
        y: 0,
      }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={clsx(
        "border-default-200 grid grid-cols-1 gap-3 rounded-large border p-4 items-center overflow-hidden lg:gap-4 lg:border-0 lg:border-t lg:rounded-none lg:px-0 lg:py-3",
        ROW_GRID,
        over && "bg-danger-50/50",
      )}
    >
      <Controller
        name={`trips.${index}.entry`}
        control={control}
        render={({ field }) => (
          <DatePicker
            variant="bordered"
            aria-label={`Date of entry, stay ${index + 1}`}
            labelPlacement="inside"
            value={parseIsoDate(field.value)}
            onChange={(date) => {
              field.onChange(date ? toIsoDate(date) : "");
            }}
            isInvalid={!!error?.entry}
            errorMessage={error?.entry}
          />
        )}
      />
      <Controller
        name={`trips.${index}.exit`}
        control={control}
        render={({ field }) => (
          <DatePicker
            variant="bordered"
            aria-label={`Date of exit, stay ${index + 1}`}
            minValue={trip.entry ? parseIsoDate(trip.entry) : undefined}
            value={parseIsoDate(field.value)}
            onChange={(date) => {
              field.onChange(date ? toIsoDate(date) : "");
            }}
            isInvalid={!!error?.exit}
            errorMessage={error?.exit}
          />
        )}
      />

      <Cell label="Days of stay">
        <span className="font-medium">
          {result ? result.daysOfStay : "\u2013"}
        </span>
      </Cell>

      <Cell label="Days in last 180 days">
        {result ? (
          <Chip size="sm" variant="flat" color={chipColor}>
            {result.daysInLast180} / 90
          </Chip>
        ) : (
          <span>{"\u2013"}</span>
        )}
      </Cell>

      <Cell label="Last day to stay">
        {result ? (
          <div className="flex flex-col">
            <span className="font-medium">
              {result.lastDayToStay
                ? formatDate(result.lastDayToStay)
                : "No days available"}
            </span>
            <span className="text-tiny text-default-500">
              {result.lastDayToStay
                ? `${plural(result.maxStayDays, "day")} max on this entry`
                : "Allowance used up on entry"}
            </span>
            {result.overstay && (
              <span className="mt-1 text-tiny font-medium text-danger">
                Over the limit by {plural(result.excessDays, "day")} from{" "}
                {formatDate(result.firstOverstayDate)}
              </span>
            )}
          </div>
        ) : (
          <span>{"\u2013"}</span>
        )}
      </Cell>

      <div className="flex justify-end lg:pt-1">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          aria-label={`Remove stay ${index + 1}`}
          onPress={() => onRemove(trip.id)}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </motion.li>
  );
}
