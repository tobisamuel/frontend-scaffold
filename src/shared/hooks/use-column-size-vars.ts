import type { RowData } from "@tanstack/react-table";
import { useLayoutEffect, useRef } from "react";

import { columnSizeVar } from "@/shared/lib/table/column-width";
import type { AppTable } from "@/shared/lib/table/table";

/**
 * Writes every visible column's size into a CSS variable on the `<table>`
 * element, outside React (v9's performant-sizing recipe). Cells read the
 * variable, so a size change reflows the browser without re-rendering a
 * single cell. See `shared/lib/table/column-width.ts`.
 */
export const useColumnSizeVars = <TData extends RowData>(
  table: AppTable<TData>
) => {
  const tableRef = useRef<HTMLTableElement | null>(null);

  useLayoutEffect(() => {
    const writeColumnSizeVars = () => {
      const tableElement = tableRef.current;

      if (!tableElement) {
        return;
      }

      for (const column of table.getVisibleLeafColumns()) {
        tableElement.style.setProperty(
          columnSizeVar(column.id),
          String(column.getSize())
        );
      }
    };

    writeColumnSizeVars();

    const subscription =
      table.atoms.columnSizing.subscribe(writeColumnSizeVars);

    return () => {
      subscription.unsubscribe();
    };
  }, [table]);

  return tableRef;
};
