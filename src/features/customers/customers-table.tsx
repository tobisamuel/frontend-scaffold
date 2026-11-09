import { getRouteApi } from "@tanstack/react-router";

import { customerColumns } from "@/features/customers/customers-columns";
import type {
  CustomersPage,
  CustomersSearch,
} from "@/features/customers/schemas";
import { DataTable } from "@/shared/components/data-table/data-table";
import { formatCount } from "@/shared/lib/format";
import { useAppTable } from "@/shared/lib/table/table";
import { searchPagination } from "@/shared/lib/table/table-options";
import { cn } from "@/shared/lib/utils";

const routeApi = getRouteApi("/_app/customers/");

export const CustomersTable = ({
  isPlaceholderData,
  page,
}: {
  isPlaceholderData: boolean;
  page: CustomersPage;
}) => {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  // Functional search writes: the patch merges into the router's current
  // search, never into a copy captured at render.
  const updateSearch = (patch: Partial<CustomersSearch>) =>
    navigate({
      replace: true,
      search: (previous) => ({ ...previous, ...patch }),
    });

  const table = useAppTable(
    {
      columns: customerColumns,
      data: page.items,
      getRowId: (row) => row.id,
      key: "customers",
      ...searchPagination({
        onSearchChange: updateSearch,
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
          // A profile is a page, not a sheet: it replaces the list.
          onRowClick={(customer) =>
            navigate({
              params: { customerId: customer.id },
              to: "/customers/$customerId",
            })
          }
          table={table}
        />
      </div>
      <table.Pagination resultsLabel={formatCount(page.total, "customer")} />
    </table.AppTable>
  );
};
