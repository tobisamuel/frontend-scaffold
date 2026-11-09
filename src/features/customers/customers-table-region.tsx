import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { customerColumns } from "@/features/customers/customers-columns";
import { CustomersTable } from "@/features/customers/customers-table";
import { customersQueryOptions } from "@/features/customers/queries";
import { DataTableErrorFrame } from "@/shared/components/data-table/data-table-error-frame";
import { DataTableSkeleton } from "@/shared/components/data-table/data-table-skeleton";

/**
 * Drawn by exactly one route, so it reads that route's typed API instead of
 * taking search as a prop. `getRouteApi` rather than importing `Route` keeps
 * the route file's code-split chunk out of this module's imports.
 */
const routeApi = getRouteApi("/_app/customers/");

/** The customers list's read. See `OrdersTableRegion` for why it splits. */
export const CustomersTableRegion = () => {
  const search = routeApi.useSearch();

  const { data, isError, isPending, isPlaceholderData, refetch } = useQuery(
    customersQueryOptions(search)
  );

  if (isPending) {
    return (
      <DataTableSkeleton
        className="min-h-0 flex-1"
        columns={customerColumns}
        rows={search.limit}
      />
    );
  }

  if (isError && !data) {
    return (
      <DataTableErrorFrame
        className="min-h-0 flex-1"
        columns={customerColumns}
        onRetry={refetch}
        tableKey="customers"
      />
    );
  }

  return <CustomersTable isPlaceholderData={isPlaceholderData} page={data} />;
};
