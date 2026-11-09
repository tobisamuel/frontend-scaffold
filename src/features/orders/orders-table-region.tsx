import { useQuery } from "@tanstack/react-query";

import {
  customerOrderColumns,
  orderColumns,
} from "@/features/orders/orders-columns";
import { OrdersTable } from "@/features/orders/orders-table";
import { ordersQueryOptions } from "@/features/orders/queries";
import type {
  Order,
  OrdersRequest,
  OrdersSearch,
} from "@/features/orders/schemas";
import { DataTableErrorFrame } from "@/shared/components/data-table/data-table-error-frame";
import { DataTableSkeleton } from "@/shared/components/data-table/data-table-skeleton";

/**
 * The orders list's read: owns pending, error and the hand-off to the table.
 *
 * Split from `OrdersTable` at the data boundary because it has to be. The
 * table instance is a hook, and a hook cannot run after the pending and error
 * early returns. So this component reads and branches, and `OrdersTable`
 * receives a page the type system knows is there: no `data?.items ?? []`,
 * which is how a failed read silently becomes an empty table.
 *
 * Drawn by two routes (the top-level list and a customer's Orders tab), so it
 * takes the request and the two navigations as props instead of reading one
 * route's search.
 */
export const OrdersTableRegion = ({
  onOpenOrder,
  onSearchChange,
  request,
}: {
  onOpenOrder: (order: Order) => void;
  onSearchChange: (patch: Partial<OrdersSearch>) => void;
  request: OrdersSearch & { customerId?: string };
}) => {
  const { data, isError, isPending, isPlaceholderData, refetch } = useQuery(
    ordersQueryOptions(request satisfies OrdersRequest)
  );

  const columns = request.customerId ? customerOrderColumns : orderColumns;
  const tableKey = request.customerId ? "customer-orders" : "orders";

  // First load only. A page or filter change keeps the previous page through
  // `keepPreviousData`, so `isPending` stays false and the rows never blank.
  if (isPending) {
    return (
      <DataTableSkeleton
        className="min-h-0 flex-1"
        columns={columns}
        rows={request.limit}
      />
    );
  }

  // `&& !data` keeps the previous page on a failed refetch, and is what
  // proves `data` defined below.
  if (isError && !data) {
    return (
      <DataTableErrorFrame
        className="min-h-0 flex-1"
        columns={columns}
        onRetry={refetch}
        tableKey={tableKey}
      />
    );
  }

  return (
    <OrdersTable
      columns={columns}
      isPlaceholderData={isPlaceholderData}
      onOpenOrder={onOpenOrder}
      onSearchChange={onSearchChange}
      page={data}
      search={request}
      tableKey={tableKey}
    />
  );
};
