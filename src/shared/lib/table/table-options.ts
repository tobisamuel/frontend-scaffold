import type { PaginationState, Updater } from "@tanstack/react-table";
import * as z from "zod";

/**
 * The `limit`/`offset` half of every server-backed list's URL contract. List
 * search schemas spread this shape in, so the page-size cap and the default
 * are written once. Pagination is plumbing, not a filter: it carries no
 * filter metadata and never draws a chip.
 *
 * The default must be one of `Pagination`'s page-size options, or the select
 * opens with nothing ticked.
 */
export const paginationParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * The four options that make the URL and a server-paginated table one system.
 *
 * `manualPagination` bypasses client slicing (the server already sliced) and
 * stops `autoResetPageIndex` from writing `pageIndex: 0` back through
 * `onPaginationChange` on every new data reference, which would undo each
 * page change one response later. `rowCount` is the server's total, without
 * which there is no last page.
 */
export const searchPagination = ({
  onSearchChange,
  rowCount,
  search,
}: {
  onSearchChange: (patch: { limit: number; offset: number }) => void;
  rowCount: number | undefined;
  search: { limit: number; offset: number };
}) => {
  const pagination: PaginationState = {
    pageIndex: search.offset / search.limit,
    pageSize: search.limit,
  };

  return {
    manualPagination: true,
    onPaginationChange: (updater: Updater<PaginationState>) => {
      // `Updater<T>` is `T | ((old: T) => T)`: the library's own contract.
      const next =
        // oxlint-disable-next-line anti-slop/no-runtime-typeof -- TanStack's Updater union is a function or a value by definition.
        typeof updater === "function" ? updater(pagination) : updater;

      onSearchChange({
        limit: next.pageSize,
        // A page-size change restarts at page 1: page 4 of 25 is row 75,
        // which is not page 4 of 100.
        offset:
          next.pageSize === search.limit ? next.pageIndex * next.pageSize : 0,
      });
    },
    rowCount,
    state: { pagination },
  };
};
