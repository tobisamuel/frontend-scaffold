import type { Customer } from "@/features/customers/schemas";
import {
  fixtureDate,
  fixtureId,
  pick,
  seededRandom,
  times,
} from "@/shared/dev/fixtures";

/**
 * Fixture customers, built rather than transcribed (docs/mocking.md): seeded,
 * anchored to `FIXTURE_NOW`, stored in the wire's shape. Delete this file with
 * `requests.mock.ts` when the customers endpoint is live.
 */

const FIRST_NAMES = [
  "Ada",
  "Bola",
  "Chen",
  "Dara",
  "Emeka",
  "Farah",
  "Gita",
  "Hugo",
  "Ines",
  "Jun",
  "Kofi",
  "Lena",
  "Musa",
  "Nora",
  "Omar",
  "Priya",
] as const;

const LAST_NAMES = [
  "Adeyemi",
  "Bauer",
  "Castillo",
  "Dube",
  "Eriksen",
  "Fujita",
  "Garcia",
  "Haddad",
  "Ivanova",
  "Johnson",
  "Kamau",
  "Larsen",
] as const;

const COMPANIES = [
  "Northwind",
  "Acme Supply",
  "Bluebird Labs",
  "Copperleaf",
  "Driftwood Co",
  "Evergreen Foods",
  "Foxglove Studio",
] as const;

const COUNTRIES = ["NG", "GB", "US", "DE", "KE", "JP", "BR"] as const;

const rng = seededRandom(20_261_101);

export const SAMPLE_CUSTOMERS: Customer[] = times(120).map(() => {
  const firstName = pick(rng, FIRST_NAMES);
  const lastName = pick(rng, LAST_NAMES);

  return {
    company: pick(rng, COMPANIES),
    country: pick(rng, COUNTRIES),
    created_at: fixtureDate(rng, 400),
    credit_limit: pick(rng, [500, 1000, 2500, 5000]),
    email: `${firstName}.${lastName}@example.com`.toLowerCase(),
    id: fixtureId(rng, "cus"),
    name: `${firstName} ${lastName}`,
    orders_count: 0,
    status: pick(rng, ["active", "active", "active", "invited", "suspended"]),
  };
});

/** Rough stand-in for a server-side sort: newest first. */
SAMPLE_CUSTOMERS.sort((a, b) => b.created_at.localeCompare(a.created_at));
