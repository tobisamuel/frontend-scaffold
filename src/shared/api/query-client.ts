import type {
  DefaultError,
  QueryExecuteOptions,
  QueryKey,
} from "@tanstack/react-query";
import { noop, QueryClient } from "@tanstack/react-query";

/**
 * Query owns server state: freshness, retries and request outcomes. Default
 * stale-time and focus behaviour stay on; one retry bounds how long a failed
 * read keeps a region in its pending state. Per-resource policy belongs on
 * that resource's query options, never here.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

/**
 * Start a query from a route loader without waiting for it.
 *
 * `prefetchQuery` did this and is deprecated; its replacement `query()`
 * rejects on failure, and a bare `void client.query(...)` turns that into an
 * unhandled rejection. This helper keeps both halves of the intent:
 *
 * - **not awaited**, so the loader never puts the route into a pending state
 *   and can never blank the layout above it, and
 * - **errors swallowed**, because a warm cache is an optimisation. The
 *   component that renders the data observes the same key and reports the
 *   failure inside its own chrome.
 */
export const prefetch = <
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
>(
  client: QueryClient,
  options: QueryExecuteOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >
) => {
  // `.catch` rather than try/await: awaiting is the one thing this must not do.
  // oxlint-disable-next-line promise/prefer-await-to-then -- cache warming stays nonblocking; the rendering query owns failures.
  client.query(options).catch(noop);
};
