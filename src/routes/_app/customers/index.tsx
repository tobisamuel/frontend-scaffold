import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { CustomersFilter } from "@/features/customers/customers-filter";
import { CustomersTableRegion } from "@/features/customers/customers-table-region";
import { customersQueryOptions } from "@/features/customers/queries";
import type { CustomersSearch } from "@/features/customers/schemas";
import {
  customersSearchFields,
  customersSearchSchema,
  defaultCustomersSearch,
} from "@/features/customers/schemas";
import { prefetch } from "@/shared/api/query-client";
import { ActiveFilters } from "@/shared/components/active-filters";

/** `/customers`: the list. A row opens the profile page, which replaces it. */
const CustomersPage = () => {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const updateSearch = (patch: Partial<CustomersSearch>) =>
    navigate({
      replace: true,
      search: (previous) => ({ ...previous, offset: 0, ...patch }),
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <CustomersFilter onApply={updateSearch} search={search} />
      </header>

      <ActiveFilters
        defaults={defaultCustomersSearch}
        fields={customersSearchFields}
        onChange={updateSearch}
        search={search}
      />

      <CustomersTableRegion />
    </div>
  );
};

export const Route = createFileRoute("/_app/customers/")({
  validateSearch: customersSearchSchema,
  search: { middlewares: [stripSearchParams(defaultCustomersSearch)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    prefetch(context.queryClient, customersQueryOptions(deps));
  },
  component: CustomersPage,
});
