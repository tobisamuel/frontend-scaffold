import { useNavigate, useSearch } from "@tanstack/react-router";

import { orderColumns } from "@/features/orders/orders-columns";
import type { OrdersPage } from "@/features/orders/schemas";
import { DataTable } from "@/shared/components/data-table/data-table";
import { formatCount } from "@/shared/lib/format";
import { useAppTable } from "@/shared/lib/table/table";
import { searchPagination } from "@/shared/lib/table/table-options";
import { cn } from "@/shared/lib/utils";

/**
 * The loaded `/orders` table. Its two props are the read's own answer, which
 * only the region holds: the page (guaranteed defined by the type) and
 * whether it is a placeholder. Everything the router knows, it asks the
 * router for: the search it pages through and the navigation a row click
 * performs.
 */
export const OrdersTable = ({
  isPlaceholderData,
  page,
}: {
  /** `keepPreviousData` is showing the last page while the next loads. */
  isPlaceholderData: boolean;
  page: OrdersPage;
}) => {
  const search = useSearch({ from: "/_app/orders" });
  const navigate = useNavigate({ from: "/orders" });

  // `() => null`: the owner of the instance subscribes to nothing; the rows
  // and the pagination bar each subscribe to the slice they draw.
  const table = useAppTable(
    {
      columns: orderColumns,
      data: page.items,
      getRowId: (row) => row.id,
      key: "orders",
      ...searchPagination({
        onSearchChange: (patch) =>
          navigate({
            replace: true,
            search: (previous) => ({ ...previous, ...patch }),
          }),
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
        <DataTable
          className="h-full"
          onRowClick={(order) =>
            navigate({
              params: { orderId: order.id },
              search: (previous) => previous,
              to: "/orders/$orderId",
            })
          }
          table={table}
        />
      </div>
      <table.Pagination resultsLabel={formatCount(page.total, "order")} />
    </table.AppTable>
  );
};
