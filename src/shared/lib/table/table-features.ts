import {
  columnSizingFeature,
  columnVisibilityFeature,
  createTableHookContexts,
  metaHelper,
  rowPaginationFeature,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * The static half of the app's table setup: which TanStack Table v9 features
 * run, what a column may declare about its own presentation, and the contexts
 * the registered table parts read themselves from.
 *
 * Separate from `table.ts` to break a cycle: the registered parts
 * (`Pagination`) need the contexts and feature type, and `table.ts` needs
 * those parts.
 *
 * v9 ships nothing you do not name, so this list is the app's actual
 * capability surface. `stockFeatures` exists and is deliberately not used.
 *
 * - `columnSizingFeature`: a column's width is `size` on its def, a number the
 *   loaded table and its skeleton both read, not a `w-[229px]` buried in a
 *   class string.
 * - `columnVisibilityFeature`: owns `row.getVisibleCells()`, the render loop
 *   itself.
 * - `rowPaginationFeature`: page state and navigation for server-paginated
 *   lists (`manualPagination`, see `table-options.ts`). Register
 *   `paginatedRowModel` too only when a table pages in memory.
 *
 * Not registered: filtering. Filters are declared on the zod search schema
 * and applied by the request (`shared/lib/filters.ts`), so the table's own
 * filter state would give every filter two homes. Add sorting
 * (`rowSortingFeature` + `sortedRowModel`) or selection when a table needs it,
 * not before.
 */
export const tableFeaturesBundle = tableFeatures({
  columnMeta: metaHelper<AppColumnMeta>(),
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
});

export type AppTableFeatures = typeof tableFeaturesBundle;

/**
 * What a column may say about how it is drawn. `DataTable` applies it to the
 * header cell and the body cells together, and `DataTableSkeleton` reads the
 * same fields, so the three can never drift apart.
 */
export interface AppColumnMeta {
  /**
   * Which edge the content sits against. A field rather than `text-right`
   * inside `className`, so the skeleton can align its bars without sniffing
   * class strings.
   */
  align?: "end" | "start";
  /** Any other per-column class: a muted colour, a tighter padding. */
  className?: string;
  /**
   * The loading body for a control column. Data columns default to a text bar;
   * a row-action column keeps its real button shape so nothing moves when
   * the data lands.
   */
  skeleton?: "action";
}

/**
 * Scoped contexts for `createTableHook`'s `AppTable`/`AppHeader`/`AppCell`
 * wrappers, so a table nested inside another table's route reads its own
 * instance rather than the nearest provider.
 */
export const {
  cellContext,
  headerContext,
  tableContext,
  useCellContext,
  useHeaderContext,
  useTableContext,
} = createTableHookContexts<AppTableFeatures>();
