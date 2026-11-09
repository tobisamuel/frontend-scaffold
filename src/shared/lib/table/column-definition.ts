import type { ColumnDef, RowData } from "@tanstack/react-table";

import type { AppTableFeatures } from "@/shared/lib/table/table-features";

/**
 * Header text known before any data arrives, for the skeleton. Component
 * headers need live table state, so they render empty while loading.
 */
export const columnHeaderText = <TData extends RowData>(
  column: ColumnDef<AppTableFeatures, TData>
) =>
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- ColumnDef.header is a string or a render function by contract.
  typeof column.header === "string" ? column.header : null;

/** A stable React key for a column def that may not declare an `id`. */
export const columnDefinitionKey = <TData extends RowData>(
  column: ColumnDef<AppTableFeatures, TData>,
  index: number
) => {
  if (column.id) {
    return column.id;
  }

  return "accessorKey" in column ? String(column.accessorKey) : String(index);
};
