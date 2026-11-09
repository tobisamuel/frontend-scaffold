/**
 * A request object with its unset fields removed, for use as a query-key
 * segment.
 *
 * TanStack Query's partial key matching compares every field of the filter
 * key, and `undefined` against `25` is a mismatch. A builder that copies unset
 * filters into its key as `undefined` therefore makes `xQueryOptions({})` match
 * no cached page, and every invalidation reaches for hand-built arrays or
 * `queryKey[0]` slices instead. With unset fields omitted, `xQueryOptions()`'s
 * key is a true prefix of every page, and query options stay the only place a
 * key is ever built (docs/data-loading.md).
 */
export const withoutUndefined = <T extends object>(request: T) =>
  // SAFETY: dropping undefined-valued entries keeps T's shape for every field that is set.
  Object.fromEntries(
    Object.entries(request).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
