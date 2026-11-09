import type { RowData } from "@tanstack/react-table";

import { DataTable } from "@/shared/components/data-table/data-table";
import { TableError } from "@/shared/components/data-table/table-error";
import { useAppTable } from "@/shared/lib/table/table";

/**
 * A list's failed read, drawn as the table it failed to become: the header
 * row and column widths stay, and the retry sits in the body.
 *
 * Drawing the frame takes a table instance, an instance is a hook, and a hook
 * cannot sit behind an early return, so some component must own one with no
 * data. This file is the only place the empty array is allowed to appear:
 * scattered `data?.items ?? []` fallbacks are how a failed read quietly
 * becomes an empty table.
 *
 * No pagination bar: "0 orders" on a failed read is a fabricated claim, and
 * the count is exactly what the request failed to return.
 */
export const DataTableErrorFrame = <TRow extends RowData>({
  className,
  columns,
  onRetry,
  tableKey,
}: {
  className?: string;
  columns: Parameters<typeof useAppTable<TRow, null>>[0]["columns"];
  onRetry: () => void;
  /** The same `key` the loaded table uses. */
  tableKey: string;
}) => {
  const table = useAppTable<TRow, null>(
    { columns, data: [], key: tableKey },
    () => null
  );

  return (
    <table.AppTable>
      <DataTable
        className={className}
        emptyContent={<TableError onRetry={onRetry} />}
        table={table}
      />
    </table.AppTable>
  );
};
