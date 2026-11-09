import type { Customer } from "@/features/customers/schemas";

/**
 * The amount by which an order would exceed the customer's credit limit, or
 * `null` when it fits.
 *
 * A bound, not a shape rule (layer B in docs/forms.md): it needs the chosen
 * customer's record, which the schema cannot see at parse time. So it is one
 * pure function with one owner, called in render to show a live message and
 * disable submit, and called again in the submit handler as a guard.
 */
export const creditOverrun = (
  amount: number | undefined,
  customer: Customer | undefined
) => {
  if (amount === undefined || !customer) {
    return null;
  }

  const overrun = amount - customer.credit_limit;

  return overrun > 0 ? overrun : null;
};
