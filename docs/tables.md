# Tables and filters

TanStack Table v9 through one app hook, `useAppTable` (`shared/lib/table/table.ts`), and one renderer, `DataTable`.

## Setup

- **Register only the features you use.** `shared/lib/table/table-features.ts` lists them: sizing, visibility and pagination today. v9 ships nothing you don't name, so that list is the app's real capability surface. Add `rowSortingFeature` + `sortedRowModel`, or selection, when a table actually needs it. Filtering is never registered: filters live on the search schema and are applied by the request.
- **`createTableHook` binds features, defaults and components.** Column files use `createAppColumnHelper<Row>()` and never write `ColumnDef<AppTableFeatures, Row>`. Pages render `<table.Pagination />`.
- **Every table has a `key`.** `useAppTable` registers each instance with the TanStack devtools table panel under that key.
- **A call site selects nothing:** `useAppTable(options, () => null)`. The rows and the pagination bar subscribe to the slices they draw, so a page turn doesn't re-render the page.

## Columns

Columns always get their own file (`orders-columns.tsx`). Width is `size` and alignment is `meta.align`, and both `DataTable` and `DataTableSkeleton` read them. Never put a width in a class string. Cells carry content; typography comes from the table primitive. Use `columnHelper.columns([...])` so value types survive. A row-action column sets `meta: { skeleton: "action" }` so its skeleton keeps the real button shape.

## The region and the table

A list is two components in two files, because a hook can't run after an early return:

- **`<name>-table-region.tsx`** reads the query and returns the skeleton on first load, the error frame on `isError && !data`, or the table.
- **`<name>-table.tsx`** receives the page as a required prop, builds the instance and draws the rows and pagination. Since the page can't be undefined, there's no `data ?? []`.

## Server pagination

`searchPagination({ onSearchChange, rowCount, search })` returns `manualPagination`, the controlled `pagination` state derived from `limit`/`offset`, and the handler that writes changes back to the URL. `manualPagination` stops the client from re-slicing and stops `autoResetPageIndex` from writing page 0 back on every new response. `rowCount` is the server's total. Changing the page size restarts at page 1.

## Filters: declared once, on the schema

```ts
status: orderStatusEnum.optional().register(filterMeta, {
  format: (value) => (value ? orderStatusMeta[value].label : null),
  label: "Status",
}),
```

- A field registered with `filterMeta` is a filter; an unregistered field (pagination) is plumbing.
- `format` returns the chip text, or `null` when the filter isn't set. That makes it the one definition of "active".
- **`.register()` comes last in the chain.** `.optional()`, `.default()` and `.array()` each return a new instance, so registering before them keys a schema that never reaches `.shape`, and the chip silently disappears.
- `ActiveFilters` walks the schema's shape and draws every chip, so a feature writes no chip JSX. Removing a chip restores that field's default.
- **Clear uses `clearedFilters(fields, defaults)`,** never `onChange(defaults)`. zod omits absent optional keys from its output, so a spread of defaults leaves old optional filters in place, and defaults include pagination, which clearing shouldn't touch.
- Section headings come from `filterLabel(fields.status)`, so a label is written once.
