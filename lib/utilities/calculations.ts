export type PercentageJob =
  | "of"
  | "ratio"
  | "increase"
  | "decrease"
  | "discount";

export function calculatePercentage(job: PercentageJob, x: number, y: number) {
  if (!Number.isFinite(x) || !Number.isFinite(y))
    throw new RangeError("Enter two valid numbers.");
  if (Math.abs(x) > 1e12 || Math.abs(y) > 1e12)
    throw new RangeError("Use numbers no larger than one trillion.");
  if (job === "ratio" && y === 0)
    throw new RangeError("The total cannot be zero.");
  if (job === "discount" && (x < 0 || x > 100 || y < 0))
    throw new RangeError(
      "Use a price of zero or more and a discount from 0 to 100%.",
    );
  const portion = (x * y) / 100;
  switch (job) {
    case "of":
      return { result: portion };
    case "ratio":
      return { result: (x / y) * 100 };
    case "increase":
      return { result: y + portion };
    case "decrease":
      return { result: y - portion };
    case "discount":
      return { result: y - portion, saved: portion };
    default:
      throw new RangeError("Choose a calculation.");
  }
}

const DAY = 86_400_000;
export type CalendarDate = { year: number; month: number; day: number };

export function parseDate(value: string): CalendarDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError("Choose a valid calendar date.");
  const [year, month, day] = match.slice(1).map(Number);
  if (
    year < 100 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month)
  ) {
    throw new RangeError(
      "Choose a valid calendar date from year 0100 to 9999.",
    );
  }
  return { year, month, day };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function serial(date: CalendarDate): number {
  return Date.UTC(date.year, date.month - 1, date.day) / DAY;
}

export function daysBetween(start: string, end: string): number {
  return serial(parseDate(end)) - serial(parseDate(start));
}

/** Calendar arithmetic in UTC day units; local DST never changes a day count.
 * Month/year anniversaries clamp to the last valid day (29 Feb → 28 Feb).
 */
export function calendarDifference(start: string, end: string) {
  const from = parseDate(start);
  const to = parseDate(end);
  if (serial(to) < serial(from))
    throw new RangeError("The end date must be on or after the start date.");
  let months = (to.year - from.year) * 12 + to.month - from.month;
  function addMonths(count: number): CalendarDate {
    const year = from.year + Math.floor((from.month - 1 + count) / 12);
    const month = ((from.month - 1 + count) % 12) + 1;
    return { year, month, day: Math.min(from.day, daysInMonth(year, month)) };
  }
  if (serial(addMonths(months)) > serial(to)) months -= 1;
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days: serial(to) - serial(addMonths(months)),
    totalDays: serial(to) - serial(from),
  };
}

export function localToday(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function readableDate(value: string): string {
  const date = parseDate(value);
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(date.year, date.month - 1, date.day)));
}
