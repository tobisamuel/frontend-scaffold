import type { orderColumns } from "@/features/orders/orders-columns";
import type {
  Order,
  OrdersPage,
  OrdersSearch,
} from "@/features/orders/schemas";
import { DataTable } from "@/shared/components/data-table/data-table";
import { formatCount } from "@/shared/lib/format";
import { useAppTable } from "@/shared/lib/table/table";
import { searchPagination } from "@/shared/lib/table/table-options";
import { cn } from "@/shared/lib/utils";

/**
 * The loaded orders table: builds the instance from a page that is
 * guaranteed defined by its props type, and draws rows and pagination.
 * Only `OrdersTableRegion` renders it.
 */
export const OrdersTable = ({
  columns,
  isPlaceholderData,
  onOpenOrder,
  onSearchChange,
  page,
  search,
  tableKey,
}: {
  columns: (typeof orderColumns)[number][];
  /** `keepPreviousData` is showing the last page while the next loads. */
  isPlaceholderData: boolean;
  onOpenOrder: (order: Order) => void;
  onSearchChange: (patch: Partial<OrdersSearch>) => void;
  page: OrdersPage;
  search: OrdersSearch;
  tableKey: string;
}) => {
  // `() => null`: the owner of the instance subscribes to nothing; the rows
  // and the pagination bar each subscribe to the slice they draw.
  const table = useAppTable(
    {
      columns,
      data: page.items,
      getRowId: (row) => row.id,
      key: tableKey,
      ...searchPagination({
        onSearchChange,
        rowCount: page.total,
        search,
      }),
    },
    () => null
  );

  return (
    <table.AppTable>
      {/* The previous page stays on screen, dimmed, while the next loads. */}
      <div
        className={cn(
          "min-h-0 flex-1 transition-opacity",
          isPlaceholderData && "opacity-60"
        )}
      >
        <DataTable className="h-full" onRowClick={onOpenOrder} table={table} />
      </div>
      <table.Pagination resultsLabel={formatCount(page.total, "order")} />
    </table.AppTable>
  );
};
