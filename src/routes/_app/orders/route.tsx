import {
  createFileRoute,
  Link,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

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
import { Button } from "@/shared/components/ui/button";

/**
 * `/orders`: the list, and the mount point for everything that floats over
 * it. The list lives in `route.tsx` and renders `<Outlet/>`, so the detail
 * sheet (`$orderId/`), the cancel confirmation (`$orderId/cancel`) and the
 * create sheet (`new`) are children that render over a list that stays
 * mounted. List-in-`index.tsx` would make them siblings, and the list would
 * unmount when a sheet opened (docs/routing.md).
 *
 * The route file composes the page: heading, actions, chips, table region,
 * outlet. Only leaves come from the feature module.
 */
const OrdersPage = () => {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  // One search sink for Apply, chip removal, Clear and paging. A filter
  // change resets to the first page; a page change carries its own offset.
  const updateSearch = (patch: Partial<OrdersSearch>) =>
    navigate({
      replace: true,
      search: (previous) => ({ ...previous, offset: 0, ...patch }),
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2">
          <OrdersFilter onApply={updateSearch} search={search} />
          <Button
            nativeButton={false}
            render={
              <Link
                from="/orders"
                search={(previous) => previous}
                to="/orders/new"
              />
            }
          >
            <PlusIcon data-icon="inline-start" />
            New order
          </Button>
        </div>
      </header>

      <ActiveFilters
        defaults={defaultOrdersSearch}
        fields={ordersSearchFields}
        onChange={updateSearch}
        search={search}
      />

      <OrdersTableRegion
        onOpenOrder={(order) =>
          navigate({
            params: { orderId: order.id },
            search: (previous) => previous,
            to: "/orders/$orderId",
          })
        }
        onSearchChange={updateSearch}
        request={search}
      />

      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/_app/orders")({
  // Options in TanStack's resolution order, not alphabetical: TypeScript
  // reads the literal top to bottom, so `loader` above `loaderDeps` would
  // infer `deps` as `{}`.
  validateSearch: ordersSearchSchema,
  // Defaults never appear in the URL: `/orders`, not `/orders?limit=25&offset=0`.
  search: { middlewares: [stripSearchParams(defaultOrdersSearch)] },
  staticData: { crumb: "Orders" },
  loaderDeps: ({ search }) => search,
  // Prefetch, never await: the route never enters a pending state, so it can
  // never blank the layout above it. The region's `useQuery` reads the same
  // key, so this is one request (with `defaultPreload: "intent"`, it starts
  // when the nav link is hovered).
  loader: ({ context, deps }) => {
    prefetch(context.queryClient, ordersQueryOptions(deps));
  },
  component: OrdersPage,
});
