/**
 * How a column's width reaches the DOM, shared by the loaded table and its
 * skeleton so the two can never disagree.
 *
 * Sizes are data: a column's pitch is `ColumnDef.size`. The table is always
 * full width with automatic layout, and every cell declares its column's size
 * as a preferred width through a CSS variable. Real content still wins, so a
 * column is the larger of its pitch and its widest content and nothing spills
 * into a neighbour.
 *
 * The loaded table writes each size into a per-column variable on the table
 * element (outside React; see `useColumnSizeVars`), and every cell copies its
 * column's variable into a cell-local one that a single static width utility
 * reads. A variable rather than a generated class because Tailwind only emits
 * classes it finds as literals in source.
 *
 * Keep class-shaped text out of comments in this file: Tailwind scans
 * comments too and emits a dead rule for every literal it finds.
 */

/** v9 merges `size: 150` into every column def that declares none. */
export const COLUMN_SIZE_DEFAULT = 150;

/** The table-level CSS variable a column's width lives in. */
export const columnSizeVar = (columnId: string) => `--col-${columnId}-size`;

/** What a loaded cell writes into its cell-local width variable. */
export const columnWidthValue = (column: { id: string }) =>
  `calc(var(${columnSizeVar(column.id)}) * 1px)`;

/** What a skeleton cell writes: the def's own pitch, no instance needed. */
export const columnWidthValueFromDef = (columnDef: { size?: number }) =>
  `${columnDef.size ?? COLUMN_SIZE_DEFAULT}px`;
