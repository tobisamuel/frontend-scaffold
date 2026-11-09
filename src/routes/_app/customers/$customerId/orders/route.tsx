import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";

import { CustomerOrdersTableRegion } from "@/features/orders/customer-orders-table-region";
import { OrdersFilter } from "@/features/orders/orders-filter";
import { ordersQueryOptions } from "@/features/orders/queries";
import {
  defaultOrdersSearch,
  ordersSearchFields,
  ordersSearchSchema,
} from "@/features/orders/schemas";
import { prefetch } from "@/shared/api/query-client";
import { ActiveFilters } from "@/shared/components/active-filters";

/**
 * `/customers/$customerId/orders`: the profile's Orders tab. The orders module
 * owns the entity everywhere it is drawn, so this tab composes the orders
 * filter and chips with its own zero-prop table pair. The sheet is a child
 * route, so the tab stays mounted under it.
 */
const CustomerOrdersTab = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-4">
    <div className="flex items-center justify-between gap-4">
      <ActiveFilters
        defaults={defaultOrdersSearch}
        fields={ordersSearchFields}
      />
      <div className="ms-auto">
        <OrdersFilter from="/_app/customers/$customerId/orders" />
      </div>
    </div>

    <CustomerOrdersTableRegion />

    <Outlet />
  </div>
);

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
