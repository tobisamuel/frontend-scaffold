import { useNavigate, useSearch } from "@tanstack/react-router";

import { customerOrderColumns } from "@/features/orders/orders-columns";
import type { OrdersPage } from "@/features/orders/schemas";
import { DataTable } from "@/shared/components/data-table/data-table";
import { formatCount } from "@/shared/lib/format";
import { useAppTable } from "@/shared/lib/table/table";
import { searchPagination } from "@/shared/lib/table/table-options";
import { cn } from "@/shared/lib/utils";

/** The loaded table for a customer's Orders tab. See `OrdersTable`. */
export const CustomerOrdersTable = ({
  isPlaceholderData,
  page,
}: {
  isPlaceholderData: boolean;
  page: OrdersPage;
}) => {
  const search = useSearch({ from: "/_app/customers/$customerId/orders" });
  const navigate = useNavigate({ from: "/customers/$customerId/orders" });

  const table = useAppTable(
    {
      columns: customerOrderColumns,
      data: page.items,
      getRowId: (row) => row.id,
      key: "customer-orders",
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
      <div
        className={cn(
          "min-h-0 flex-1 transition-opacity",
          isPlaceholderData && "opacity-60"
        )}
      >
        <DataTable
          className="h-full"
          // `$customerId` is inherited from the current match, so only the
          // order is named here.
          onRowClick={(order) =>
            navigate({
              params: { orderId: order.id },
              search: (previous) => previous,
              to: "$orderId",
            })
          }
          table={table}
        />
      </div>
      <table.Pagination resultsLabel={formatCount(page.total, "order")} />
    </table.AppTable>
  );
};
