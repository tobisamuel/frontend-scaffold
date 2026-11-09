/**
 * Number formatting. Dates are not here on purpose: write `format(parseISO(
 * value), "MMM d, yyyy")` from date-fns at the cell (docs/conventions.md).
 * A helper earns a place only with logic beyond "handle null, then format".
 */

const moneyFormatters = new Map<string, Intl.NumberFormat>();

/**
 * `12.5, "USD"` → `$12.50`. Formatters are cached per currency because
 * constructing an `Intl.NumberFormat` is slow, and a table formats every row.
 */
export const formatMoney = (amount: number, currency: string) => {
  const formatter =
    moneyFormatters.get(currency) ??
    new Intl.NumberFormat("en-US", { currency, style: "currency" });

  moneyFormatters.set(currency, formatter);

  return formatter.format(amount);
};

/** `1, "order"` → `1 order`; `1200, "order"` → `1,200 orders`. */
export const formatCount = (count: number, noun: string) =>
  `${count.toLocaleString("en-US")} ${count === 1 ? noun : `${noun}s`}`;
