import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";

import { OrdersFilter } from "@/features/orders/orders-filter";
import { OrdersTableRegion } from "@/features/orders/orders-table-region";
import { ordersQueryOptions } from "@/features/orders/queries";
import type { OrdersSearch } from "@/features/orders/schemas";
import {
  defaultOrdersSearch,
  ordersSearchFields,
  ordersSearchSchema,
} from "@/features/orders/schemas";
import { prefetch } from "@/shared/api/query-client";
import { ActiveFilters } from "@/shared/components/active-filters";

/**
 * `/customers/$customerId/orders`: the profile's Orders tab. The orders
 * module owns the entity everywhere it is drawn, so this route composes the
 * same filter, chips and table region as `/orders`, scoped by `customerId`.
 * The sheet is a child route, so the tab stays mounted under it.
 */
const CustomerOrdersTab = () => {
  const { customerId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const updateSearch = (patch: Partial<OrdersSearch>) =>
    navigate({
      replace: true,
      search: (previous) => ({ ...previous, offset: 0, ...patch }),
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <ActiveFilters
          defaults={defaultOrdersSearch}
          fields={ordersSearchFields}
          onChange={updateSearch}
          search={search}
        />
        <div className="ms-auto">
          <OrdersFilter onApply={updateSearch} search={search} />
        </div>
      </div>

      <OrdersTableRegion
        onOpenOrder={(order) =>
          navigate({
            params: { customerId, orderId: order.id },
            search: (previous) => previous,
            to: "/customers/$customerId/orders/$orderId",
          })
        }
        onSearchChange={updateSearch}
        request={{ ...search, customerId }}
      />

      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/_app/customers/$customerId/orders")({
  validateSearch: ordersSearchSchema,
  search: { middlewares: [stripSearchParams(defaultOrdersSearch)] },
  staticData: { crumb: "Orders" },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps, params }) => {
    prefetch(
      context.queryClient,
      ordersQueryOptions({ ...deps, customerId: params.customerId })
    );
  },
  component: CustomerOrdersTab,
});
