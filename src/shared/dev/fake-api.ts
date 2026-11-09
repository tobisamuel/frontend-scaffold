/**
 * Fake network latency and failure, so loading and error states are real code
 * paths from day one instead of something that only exists in a design.
 *
 * Fixture rows are module constants. Without a delay every screen would render
 * fully populated on the first frame, and the skeletons, the `keepPreviousData`
 * transitions and the error frames would be dead code nobody finds out is
 * wrong until a real endpoint is wired. With a delay in front of them, the
 * router and Query machinery does the real work now.
 *
 * This file is the seam. A feature's `requests.mock.ts` wraps every request in
 * `fakeRequest`; its live twin, `requests.ts`, makes the same call through
 * `shared/api/client.ts` with the same signature, and nothing above it changes.
 * Delete `shared/dev/` when the last mock file goes. See docs/mocking.md.
 */

/**
 * Deterministic, not random: the same sequence of navigations takes the same
 * time on every machine, so a screenshot either always catches the skeleton
 * or never does. The band sits above ~200ms, where a skeleton starts to earn
 * its place, and below ~1s, where people assume something broke.
 */
const LATENCY_CYCLE = [420, 680, 340, 900, 520] as const;

let latencyIndex = 0;

/**
 * Reads a dev switch from localStorage on every request, so it can be flipped
 * from the console and the next navigation obeys it without a reload that
 * would throw away the cache you wanted to watch.
 *
 * `try`/`catch` because a private window or blocked site data throws on the
 * accessor itself, and a dev convenience must never stop the app fetching.
 */
const readSwitch = (key: string) => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

/**
 * `localStorage.setItem("mockLatency", "8")` stretches every delay eightfold,
 * long enough to read, screenshot or inspect a skeleton. Anything missing,
 * unparseable or non-positive means 1.
 */
const latencyScale = () => {
  const scale = Number(readSwitch("mockLatency"));

  return Number.isFinite(scale) && scale > 0 ? scale : 1;
};

/**
 * `localStorage.setItem("mockFail", "orders")` makes every request whose name
 * contains `orders` reject, so each region's error frame and retry can be
 * exercised without a backend. `removeItem("mockFail")` restores them.
 */
const shouldFail = (name: string) => {
  const pattern = readSwitch("mockFail");

  return Boolean(pattern && name.includes(pattern));
};

const nextLatency = () => {
  const delay = LATENCY_CYCLE[latencyIndex % LATENCY_CYCLE.length] ?? 500;
  latencyIndex += 1;

  return delay * latencyScale();
};

/**
 * Resolves `run()` after one turn of the latency cycle.
 *
 * `name` identifies the request for the `mockFail` switch; use the endpoint
 * the live request will call (`"GET orders"`, `"POST orders/:id/cancel"`).
 *
 * `run` is a thunk rather than a value so the work happens after the wait,
 * the way a request does. That matters for writes: a mutation's fixture
 * update lands when the response would, so an invalidation that fires early
 * refetches stale data exactly as it would against a server.
 *
 * The answer is a deep copy, because a network response always is. Handing
 * back the fixture objects themselves lets a write mutate data Query already
 * holds, and the refetch then compares equal to the cache (it *is* the
 * cache), so structural sharing keeps the old reference and nothing
 * re-renders: a cancelled order would stay "Processing" on screen.
 */
export const fakeRequest = <T>(name: string, run: () => T): Promise<T> =>
  // A timer is what is being wrapped, so there is no existing promise to return.
  // oxlint-disable-next-line promise/avoid-new -- wrapping setTimeout is the one place a Promise constructor is the right tool.
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail(name)) {
        reject(new Error(`Mock failure: ${name}`));

        return;
      }

      try {
        resolve(structuredClone(run()));
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    }, nextLatency());
  });

/**
 * Free-text search over fixture rows: the mock stand-in for what an
 * endpoint's `q` parameter does server-side.
 */
export const searchRows = <T>(rows: readonly T[], query: string) => {
  const needle = query.trim().toLowerCase();

  if (needle.length === 0) {
    return [...rows];
  }

  return rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(needle)
  );
};
