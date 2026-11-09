import type { ColumnDef, RowData } from "@tanstack/react-table";
import { EllipsisIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  columnDefinitionKey,
  columnHeaderText,
} from "@/shared/lib/table/column-definition";
import { columnWidthValueFromDef } from "@/shared/lib/table/column-width";
import type { AppTableFeatures } from "@/shared/lib/table/table-features";
import { cn } from "@/shared/lib/utils";

/**
 * The loading body for `DataTable`, built from the **same column array** the
 * loaded table uses.
 *
 * That is the whole idea. A hand-drawn placeholder drifts the moment a column
 * is widened or reordered, and the drift shows as the table jumping sideways
 * when data lands. Reading each column's own `size` and `meta.align` means
 * every column is already the right width before anything is fetched.
 *
 * Headers render as real text: a column's name is known at build time and
 * has nothing to wait for. Only cells shimmer. A row-action column keeps its
 * real button shape (`meta.skeleton: "action"`), inert, so nothing moves.
 */
export const DataTableSkeleton = <TData extends RowData>({
  className,
  columns,
  rows,
}: {
  /** The same bound the loaded table takes. */
  className?: string;
  columns: ColumnDef<AppTableFeatures, TData>[];
  /** Match the page size requested, usually `search.limit`. */
  rows: number;
}) => (
  <div className={cn("overflow-auto", className)}>
    <Table aria-busy>
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          {columns.map((column, index) => (
            <TableHead
              className={cn(
                "w-(--col-width)",
                column.meta?.align === "end" && "text-right",
                column.meta?.className
              )}
              key={columnDefinitionKey(column, index)}
              // SAFETY: React writes unknown `--*` style keys to the DOM unchanged; CSSProperties omits them.
              style={
                {
                  "--col-width": columnWidthValueFromDef(column),
                } as CSSProperties
              }
            >
              {columnHeaderText(column)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <TableRow className="pointer-events-none" key={rowIndex}>
            {columns.map((column, columnIndex) => (
              <TableCell
                className={cn(
                  "w-(--col-width)",
                  column.meta?.align === "end" && "text-right",
                  column.meta?.className
                )}
                key={columnDefinitionKey(column, columnIndex)}
                // SAFETY: React writes unknown `--*` style keys to the DOM unchanged; CSSProperties omits them.
                style={
                  {
                    "--col-width": columnWidthValueFromDef(column),
                  } as CSSProperties
                }
              >
                {column.meta?.skeleton === "action" ? (
                  <Button
                    aria-hidden
                    className="ms-auto flex"
                    inert
                    size="icon-sm"
                    variant="ghost"
                  >
                    <EllipsisIcon />
                  </Button>
                ) : (
                  <Skeleton
                    className={cn(
                      "my-1.5 h-3 w-full",
                      column.meta?.align === "end" && "ms-auto"
                    )}
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
