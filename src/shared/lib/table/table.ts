import { createTableHook } from "@tanstack/react-table";
import type { AppReactTable, RowData } from "@tanstack/react-table";
import { useTanStackTableDevtools } from "@tanstack/react-table-devtools";

import { Pagination } from "@/shared/components/data-table/pagination";
import type { AppTableFeatures } from "@/shared/lib/table/table-features";
import {
  cellContext,
  headerContext,
  tableContext,
  tableFeaturesBundle,
} from "@/shared/lib/table/table-features";

const tableComponents = { Pagination };

type NoComponents = Record<never, never>;

/**
 * What `useAppTable` returns: the v9 instance plus the `App*` wrappers and the
 * registered `table.Pagination`. Anything that takes a table as a prop takes
 * this.
 *
 * `TSelected` defaults to `null` because a call site selects nothing: passing
 * `() => null` opts the component that owns the instance out of table-state
 * re-renders, and each region that draws state (rows, pagination) subscribes
 * to its own slice where it draws it.
 */
export type AppTable<TData extends RowData, TSelected = null> = AppReactTable<
  AppTableFeatures,
  TData,
  TSelected,
  typeof tableComponents,
  NoComponents,
  NoComponents
>;

/**
 * Where TanStack Table v9 enters the app. `createTableHook` does three jobs:
 *
 * 1. **Binds the feature set**, so no column file writes
 *    `ColumnDef<AppTableFeatures, T>` and no page passes `features`.
 * 2. **Carries app-wide defaults**, declared once below and overridable at any
 *    call site.
 * 3. **Registers components**, so a page renders `<table.Pagination />`
 *    instead of threading the instance through props.
 */
const {
  createAppColumnHelper,
  useAppTable: useBoundTable,
  useCellContext,
  useHeaderContext,
  useTableContext,
} = createTableHook({
  /**
   * The URL owns the page on every server list, so new data must not move it.
   * The v8-era reset would fight the router and leave the address bar
   * disagreeing with the table.
   */
  autoResetPageIndex: false,
  cellContext,
  defaultColumn: { minSize: 64, size: 160 },
  features: tableFeaturesBundle,
  headerContext,
  tableComponents,
  tableContext,
});

/**
 * `createTableHook`'s hook with devtools registration folded in, so every app
 * table appears in the TanStack devtools panel without each call site
 * remembering to register it. A table is identified there by its `key`
 * option: give every table one. The devtools package ships no-ops in
 * production builds.
 */
export const useAppTable: typeof useBoundTable = (options, selector) => {
  const table = useBoundTable(options, selector);

  useTanStackTableDevtools(table);

  return table;
};

export {
  createAppColumnHelper,
  useCellContext,
  useHeaderContext,
  useTableContext,
};
