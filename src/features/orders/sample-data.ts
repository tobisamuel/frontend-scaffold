import { SAMPLE_CUSTOMERS } from "@/features/customers/sample-data";
import type { Order, OrderStatus } from "@/features/orders/schemas";
import {
  fixtureDate,
  fixtureId,
  pick,
  pickAmount,
  pickInt,
  seededRandom,
  times,
} from "@/shared/dev/fixtures";

/**
 * Fixture orders. A mutable module array because the mock writes
 * (`createOrder`, `cancelOrder`) change it, which is what lets invalidation be
 * exercised for real: the refetch after a cancel returns the cancelled row.
 * A reload resets it, the way a fresh fixture database would.
 */

const rng = seededRandom(1042);

const STATUSES: readonly OrderStatus[] = [
  "pending",
  "processing",
  "processing",
  "shipped",
  "delivered",
  "delivered",
  "delivered",
  "cancelled",
];

export const SAMPLE_ORDERS: Order[] = times(340).map((index) => {
  const customer = pick(rng, SAMPLE_CUSTOMERS);
  const status = pick(rng, STATUSES);
  const createdAt = fixtureDate(rng, 120);

  return {
    cancelled_at: status === "cancelled" ? createdAt : null,
    created_at: createdAt,
    currency: "USD",
    customer_id: customer.id,
    customer_name: customer.name,
    id: fixtureId(rng, "ord"),
    items_count: pickInt(rng, 1, 9),
    note: null,
    number: `ORD-${String(1000 + index)}`,
    status,
    total: pickAmount(rng, 12, 2400),
  };
});

SAMPLE_ORDERS.sort((a, b) => b.created_at.localeCompare(a.created_at));
