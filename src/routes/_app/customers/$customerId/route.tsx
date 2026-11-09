import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { customerStatusMeta } from "@/features/customers/constants";
import { CustomerBreadcrumb } from "@/features/customers/customer-breadcrumb";
import { customerQueryOptions } from "@/features/customers/queries";
import { useRecentlyViewed } from "@/features/customers/stores/recently-viewed";
import { prefetch } from "@/shared/api/query-client";
import { TableError } from "@/shared/components/data-table/table-error";
import { Badge } from "@/shared/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * `/customers/$customerId`: the profile layout. Identity header, tabs, and
 * the outlet each tab renders into. Tabs are routes, so each has a URL and
 * its own loader.
 *
 * The identity read renders its own outcomes in the header. Tabs render
 * regardless: they own their reads, so a slow identity never holds back the
 * Orders table.
 */
const CustomerLayout = () => {
  const { customerId } = Route.useParams();

  const {
    data: customer,
    isError,
    isPending,
    refetch,
  } = useQuery(customerQueryOptions(customerId));

  if (isError) {
    return (
      <TableError onRetry={refetch} title="We could not load this customer" />
    );
  }

  if (customer === null) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyTitle>Customer not found</EmptyTitle>
          <EmptyDescription>
            It may have been removed, or the link may be wrong.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
      <header className="flex flex-col gap-1">
        {isPending ? (
          <>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{customer.name}</h1>
              <Badge variant={customerStatusMeta[customer.status].variant}>
                {customerStatusMeta[customer.status].label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {customer.company} · {customer.email}
            </p>
          </>
        )}
      </header>

      <nav aria-label="Customer sections" className="flex gap-1 border-b">
        <Link
          activeOptions={{ exact: true }}
          className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground data-[status=active]:border-foreground data-[status=active]:text-foreground"
          params={{ customerId }}
          to="/customers/$customerId"
        >
          Overview
        </Link>
        <Link
          className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground data-[status=active]:border-foreground data-[status=active]:text-foreground"
          params={{ customerId }}
          to="/customers/$customerId/orders"
        >
          Orders
        </Link>
      </nav>

      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/_app/customers/$customerId")({
  // A label component, not a string: it observes the customer query, so the
  // crumb shows the live name and falls back to the id while it loads.
  staticData: { crumb: CustomerBreadcrumb },
  loader: ({ context, params }) => {
    prefetch(context.queryClient, customerQueryOptions(params.customerId));
  },
  // `onEnter` runs when the route is entered, never on hover preload, which
  // is why the visit is recorded here and not in the loader or an effect.
  onEnter: ({ params }) => {
    useRecentlyViewed.getState().visit(params.customerId);
  },
  component: CustomerLayout,
});
