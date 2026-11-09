import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useTableContext } from "@/shared/lib/table/table-features";

/**
 * Page sizes offered, capped at `paginationParamsSchema`'s max. Every list's
 * `limit` default must be one of these or the select shows no tick.
 */
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

/**
 * The bottom bar of a paginated table, registered on `useAppTable` so a page
 * renders `<table.Pagination />`.
 *
 * It talks only to table APIs, so it serves both modes without a branch: a
 * server list drives it through `manualPagination` + `rowCount`, an in-memory
 * one through the paginated row model.
 *
 * It reads the page from its own subscription, not `table.state`: the
 * component that created the instance selected nothing, so paging repaints
 * this bar and the rows and nothing else on screen.
 */
export const Pagination = ({ resultsLabel }: { resultsLabel?: string }) => {
  const table = useTableContext();

  return (
    <table.Subscribe selector={(state) => state.pagination}>
      {({ pageIndex, pageSize }) => {
        // An empty result has no pages, and "1 / 0" reads as a bug.
        const pageCount = table.getPageCount() || 1;

        return (
          <footer className="flex shrink-0 items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-1">
              <Button
                aria-label="First page"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
                size="icon-sm"
                variant="ghost"
              >
                <ChevronsLeftIcon />
              </Button>
              <Button
                aria-label="Previous page"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                size="icon-sm"
                variant="ghost"
              >
                <ChevronLeftIcon />
              </Button>
              <span
                aria-live="polite"
                className="min-w-12 text-center text-xs tabular-nums"
              >
                {pageIndex + 1} / {pageCount}
              </span>
              <Button
                aria-label="Next page"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                size="icon-sm"
                variant="ghost"
              >
                <ChevronRightIcon />
              </Button>
              <Button
                aria-label="Last page"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(pageCount - 1)}
                size="icon-sm"
                variant="ghost"
              >
                <ChevronsRightIcon />
              </Button>
            </div>

            {resultsLabel ? (
              <span className="text-xs text-muted-foreground">
                {resultsLabel}
              </span>
            ) : null}

            <Select
              onValueChange={(value) => table.setPageSize(Number(value))}
              value={String(pageSize)}
            >
              <SelectTrigger aria-label="Rows per page" size="sm">
                <SelectValue>{(value) => `${String(value)} rows`}</SelectValue>
              </SelectTrigger>
              {/* base-ui's alignItemWithTrigger never resolves a side when the
                  select sits inside a dialog or sheet, and this bar renders in
                  sheets too. Off everywhere keeps one behaviour. */}
              <SelectContent align="end" alignItemWithTrigger={false}>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </footer>
        );
      }}
    </table.Subscribe>
  );
};
