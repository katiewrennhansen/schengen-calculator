export type TripInput = {
  id: string;
  /** "YYYY-MM-DD" or "" */
  entry: string;
  /** "YYYY-MM-DD" or "" */
  exit: string;
};

export type TripResult = {
  id: string;
  entry: string;
  exit: string;
  /** Inclusive length of this stay. */
  daysOfStay: number;
  /** Days spent in Schengen in the 180 days up to and including the exit date. */
  daysInLast180: number;
  /** Last day you could have stayed on this trip without breaking the rule. */
  lastDayToStay: string | null;
  /** How many days that trip could have lasted at most. */
  maxStayDays: number;
  /** True when any day of this stay breaches the 90/180 rule. */
  overstay: boolean;
  /** Worst-case number of days over the 90-day limit during this stay. */
  excessDays: number;
  /** First day of this stay that breached the rule. */
  firstOverstayDate: string | null;
};

export type Plan = {
  /** The date the summary is evaluated for. */
  referenceDate: string;
  /** First day of the 180-day window ending on the reference date. */
  windowStart: string;
  daysUsed: number;
  daysRemaining: number;
  /** Earliest day (on/after the reference date) you could be in Schengen. */
  nextEntry: string | null;
  /** Last day you could stay if you entered on `nextEntry`. */
  nextLastDay: string | null;
  nextMaxDays: number;
};

export type CalculationResult = {
  trips: TripResult[];
  plan: Plan;
};

export type ValidationErrors = Record<
  string,
  { entry?: string; exit?: string }
>;
