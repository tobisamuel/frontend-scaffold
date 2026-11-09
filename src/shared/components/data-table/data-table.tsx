import type { RowData } from "@tanstack/react-table";
import type { CSSProperties, ReactNode } from "react";

import { TableNoRecords } from "@/shared/components/data-table/table-no-records";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useColumnSizeVars } from "@/shared/hooks/use-column-size-vars";
import { columnWidthValue } from "@/shared/lib/table/column-width";
import type { AppTable } from "@/shared/lib/table/table";
import { cn } from "@/shared/lib/utils";

/**
 * Every control a click inside a row could have been aimed at. A click that
 * lands on one of these belongs to that control, not to the row.
 */
const INTERACTIVE_SELECTOR =
  'a,button,input,select,textarea,label,[role="checkbox"],[role="menuitem"],[data-row-click="ignore"]';

interface DataTableProps<TData extends RowData> {
  table: AppTable<TData>;
  /** Visually hidden table subject, for tables with no page heading. */
  caption?: ReactNode;
  /**
   * Bounds the scroll region: `h-full` when the parent bounds it, `min-h-0
   * flex-1` when the table is a flex child.
   */
  className?: string;
  /** What fills the body on a successful empty answer. */
  emptyContent?: ReactNode;
  /**
   * Opens the row's record. A callback rather than a `to`/`params` pair so the
   * page owns its routing; the table has no business knowing where a row
   * leads.
   */
  onRowClick?: (row: TData) => void;
}

/**
 * The shell every table renders through. Three decisions live here so no
 * call site re-decides them:
 *
 * **Geometry comes from the column def.** `size` and `meta.align` reach the
 * header cell and every body cell from one place, so a money column's edge
 * can never disagree with its header.
 *
 * **Rows render inside one subscription.** The page creates the instance
 * selecting nothing; this subscribes to the slices a redraw depends on, so a
 * page turn repaints the body and nothing above it.
 *
 * **A click inside a row is not always a click on the row.** See the handler.
 */
export const DataTable = <TData extends RowData>({
  caption,
  className,
  emptyContent,
  onRowClick,
  table,
}: DataTableProps<TData>) => {
  const tableRef = useColumnSizeVars(table);

  return (
    <table.Subscribe selector={(state) => ({ pagination: state.pagination })}>
      {() => (
        <div className={cn("overflow-auto", className)}>
          <Table ref={tableRef}>
            {caption ? (
              <TableCaption className="sr-only">{caption}</TableCaption>
            ) : null}
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className={cn(
                        "w-(--col-width)",
                        header.column.columnDef.meta?.align === "end" &&
                          "text-right",
                        header.column.columnDef.meta?.className
                      )}
                      colSpan={header.colSpan}
                      key={header.id}
                      // SAFETY: React writes unknown `--*` style keys to the DOM unchanged; CSSProperties omits them.
                      style={
                        {
                          "--col-width": columnWidthValue(header.column),
                        } as CSSProperties
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className={cn(onRowClick && "cursor-pointer")}
                    key={row.id}
                    onClick={
                      onRowClick
                        ? (event) => {
                            // SAFETY: React only dispatches clicks from elements; `contains`/`closest` are the checks and fail closed.
                            const target = event.target as Element;

                            // Two different ways a click reaches the row without
                            // being aimed at it:
                            //
                            // 1. A cell that renders a menu or dialog keeps that
                            //    content in the row's React tree even though the
                            //    DOM is portalled to <body>, and React bubbles
                            //    synthetic events along the React tree. Clicking
                            //    inside the portal is not a DOM descendant of the
                            //    row. (This is why row confirmations are routes:
                            //    docs/overlays.md.)
                            // 2. A control inside the row already handled the
                            //    click. Narrowing the row's claim here saves every
                            //    control from remembering stopPropagation.
                            if (
                              !event.currentTarget.contains(target) ||
                              target.closest(INTERACTIVE_SELECTOR)
                            ) {
                              return;
                            }

                            onRowClick(row.original);
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        className={cn(
                          "w-(--col-width)",
                          cell.column.columnDef.meta?.align === "end" &&
                            "text-right",
                          cell.column.columnDef.meta?.className
                        )}
                        key={cell.id}
                        // SAFETY: React writes unknown `--*` style keys to the DOM unchanged; CSSProperties omits them.
                        style={
                          {
                            "--col-width": columnWidthValue(cell.column),
                          } as CSSProperties
                        }
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={table.getVisibleLeafColumns().length}>
                    {emptyContent ?? <TableNoRecords />}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </table.Subscribe>
  );
};
