import { useQuery } from "@tanstack/react-query";
import { useParams, useSearch } from "@tanstack/react-router";

import { CustomerOrdersTable } from "@/features/orders/customer-orders-table";
import { customerOrderColumns } from "@/features/orders/orders-columns";
import { ordersQueryOptions } from "@/features/orders/queries";
import { DataTableErrorFrame } from "@/shared/components/data-table/data-table-error-frame";
import { DataTableSkeleton } from "@/shared/components/data-table/data-table-skeleton";

/**
 * A customer's Orders tab: the same entity as `/orders`, drawn on a different
 * surface. The orders module owns both, as two zero-prop pairs that each read
 * their own route, rather than one shared pair that has to be told by props
 * which route it is on and how to navigate from it.
 */
export const CustomerOrdersTableRegion = () => {
  const search = useSearch({ from: "/_app/customers/$customerId/orders" });

  const { customerId } = useParams({
    from: "/_app/customers/$customerId/orders",
  });

  const { data, isError, isPending, isPlaceholderData, refetch } = useQuery(
    ordersQueryOptions({ ...search, customerId })
  );

  if (isPending) {
    return (
      <DataTableSkeleton
        className="min-h-0 flex-1"
        columns={customerOrderColumns}
        rows={search.limit}
      />
    );
  }

  if (isError && !data) {
    return (
      <DataTableErrorFrame
        className="min-h-0 flex-1"
        columns={customerOrderColumns}
        onRetry={refetch}
        tableKey="customer-orders"
      />
    );
  }

  return (
    <CustomerOrdersTable isPlaceholderData={isPlaceholderData} page={data} />
  );
};
