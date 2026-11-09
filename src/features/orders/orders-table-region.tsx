import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { orderColumns } from "@/features/orders/orders-columns";
import { OrdersTable } from "@/features/orders/orders-table";
import { ordersQueryOptions } from "@/features/orders/queries";
import { DataTableErrorFrame } from "@/shared/components/data-table/data-table-error-frame";
import { DataTableSkeleton } from "@/shared/components/data-table/data-table-skeleton";

/**
 * The `/orders` list's read: owns pending, error and the hand-off to the
 * table. It takes no props. Search comes from its own route, so the route
 * file renders `<OrdersTableRegion />` and passes nothing down
 * (docs/architecture.md, "Props").
 *
 * Split from `OrdersTable` at the data boundary because it has to be: the
 * table instance is a hook, and a hook cannot run after the pending and error
 * early returns. `OrdersTable` then receives a page the type system knows is
 * there, so there is no `data?.items ?? []` turning a failed read into an
 * empty table.
 *
 * A customer's Orders tab is a different surface with a different route, so it
 * has its own pair (`customer-orders-table-region.tsx`) rather than this one
 * growing props to serve both.
 */
export const OrdersTableRegion = () => {
  const search = useSearch({ from: "/_app/orders" });

  const { data, isError, isPending, isPlaceholderData, refetch } = useQuery(
    ordersQueryOptions(search)
  );

  // First load only. A page or filter change keeps the previous page through
  // `keepPreviousData`, so `isPending` stays false and the rows never blank.
  if (isPending) {
    return (
      <DataTableSkeleton
        className="min-h-0 flex-1"
        columns={orderColumns}
        rows={search.limit}
      />
    );
  }

  // `&& !data` keeps the previous page on a failed refetch, and is what
  // proves `data` defined below.
  if (isError && !data) {
    return (
      <DataTableErrorFrame
        className="min-h-0 flex-1"
        columns={orderColumns}
        onRetry={refetch}
        tableKey="orders"
      />
    );
  }

  return <OrdersTable isPlaceholderData={isPlaceholderData} page={data} />;
};
