import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import * as z from "zod";

/**
 * A date range is one search field, `{ from, to }`, never a `from_date` /
 * `to_date` pair. The two halves are always set and cleared together, a
 * per-field filter registry cannot describe a pair, and TanStack Router
 * serialises object search params as JSON.
 *
 * ISO date strings, not `Date` objects: `stripSearchParams` and RHF both
 * deep-compare this value, and strings compare trivially. The conversion to
 * `Date` happens at the calendar boundary.
 */
export const dateRangeSchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

export type DateRangeValue = z.infer<typeof dateRangeSchema>;

/**
 * `parseISO`, never `new Date(str)`: the Date constructor reads a bare
 * `yyyy-MM-dd` as UTC midnight, which renders as the previous day anywhere
 * west of Greenwich. `parseISO` reads it as local.
 */
export const toDateRange = (value?: DateRangeValue): DateRange | undefined =>
  value ? { from: parseISO(value.from), to: parseISO(value.to) } : undefined;

/** A first click in range mode leaves `to` unset: a one-day range. */
export const fromDateRange = (range?: DateRange): DateRangeValue | undefined =>
  range?.from
    ? {
        from: format(range.from, "yyyy-MM-dd"),
        to: format(range.to ?? range.from, "yyyy-MM-dd"),
      }
    : undefined;

/**
 * The chip and trigger sentence for a range. Composition, not formatting, so
 * it earns a helper; plain date display is an inline `format()` at the cell.
 */
export const formatDateRange = (value?: DateRangeValue) => {
  if (!value) {
    return null;
  }

  if (value.from === value.to) {
    return format(parseISO(value.from), "MMM d, yyyy");
  }

  return `${format(parseISO(value.from), "MMM d, yyyy")} – ${format(parseISO(value.to), "MMM d, yyyy")}`;
};
