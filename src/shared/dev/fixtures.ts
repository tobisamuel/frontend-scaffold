/**
 * Fixture plumbing: the small amount of machinery sample rows need so screens
 * behave like the real thing rather than merely looking like it. Three rules:
 *
 * **Deterministic.** Everything comes off a seeded generator, so a row's id
 * survives a reload, a rebuild and someone else's machine. A detail URL that
 * changes every render is not a URL. That rules out `Math.random()` and
 * `Date.now()` at module scope.
 *
 * **Anchored in time.** `FIXTURE_NOW` is a fixed instant, not the clock, so
 * "last 7 days" means the same seven days every time a range filter runs.
 *
 * **Stored as the wire stores it.** Dates are ISO strings, statuses are the
 * backend's keys, ids look like the backend's ids. Formatting happens at the
 * cell. A design's `Oct 1, 2026 3:45pm` is a rendering, not a storage format,
 * and a range filter cannot compare rendered strings.
 */

export const FIXTURE_NOW = new Date("2026-11-01T12:00:00.000Z");

const MS_PER_DAY = 86_400_000;

/**
 * A linear congruential generator (Numerical Recipes constants, mod 2^32).
 * Poor for anything that matters and exactly right for fixtures: evenly
 * spread, identical on every engine, and free of bitwise operators.
 */
const MODULUS = 2 ** 32;
const MULTIPLIER = 1_664_525;
const INCREMENT = 1_013_904_223;

export const seededRandom = (seed: number) => {
  let state = seed % MODULUS;

  return () => {
    state = (state * MULTIPLIER + INCREMENT) % MODULUS;

    return state / MODULUS;
  };
};

export type Rng = ReturnType<typeof seededRandom>;

/** One of `values`, uniformly. An empty list is a caller bug. */
export const pick = <T>(rng: Rng, values: readonly T[]): T => {
  const value = values[Math.floor(rng() * values.length)];

  if (value === undefined) {
    throw new Error("pick() was given an empty list");
  }

  return value;
};

/** An integer in `[min, max]`. */
export const pickInt = (rng: Rng, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

/** A number in `[min, max]` rounded to two decimal places. */
export const pickAmount = (rng: Rng, min: number, max: number) =>
  Math.round((min + rng() * (max - min)) * 100) / 100;

/**
 * A URL-safe id: a prefix and 12 base-36 characters. Reads as an opaque key
 * in the address bar without pretending to be a UUID.
 */
export const fixtureId = (rng: Rng, prefix: string) => {
  let body = "";

  while (body.length < 12) {
    body += Math.floor(rng() * 36 ** 6)
      .toString(36)
      .padStart(6, "0");
  }

  return `${prefix}_${body.slice(0, 12)}`;
};

/**
 * An ISO instant up to `daysAgo` days before `FIXTURE_NOW`, to the minute.
 * Every surface formats to the minute, and a stray `:37.482` in a fixture
 * only ever surfaces as a bug report.
 */
export const fixtureDate = (rng: Rng, daysAgo: number) => {
  const at = new Date(FIXTURE_NOW.getTime() - rng() * daysAgo * MS_PER_DAY);
  at.setSeconds(0, 0);

  return at.toISOString();
};

/** `[0, 1, … count - 1]`. */
export const times = (count: number) =>
  Array.from({ length: count }, (_, index) => index);
