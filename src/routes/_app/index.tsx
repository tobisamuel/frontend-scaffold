import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { customersQueryOptions } from "@/features/customers/queries";
import { ordersQueryOptions } from "@/features/orders/queries";
import { prefetch } from "@/shared/api/query-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Home. Three independent reads, three independent regions: each card owns
 * its own pending and failed state, so one slow or failed count never holds
 * back or blanks the others (docs/loading-and-errors.md).
 *
 * The counts reuse the list builders with `limit: 1`, reading only `total`.
 * A real dashboard would have a summary endpoint; the point here is that
 * every read, however small, goes through query options.
 */
const pendingOrdersRequest = { limit: 1, status: "pending" } as const;
const allOrdersRequest = { limit: 1 } as const;
const activeCustomersRequest = { limit: 1, status: "active" } as const;

const HomePage = () => {
  const pendingOrders = useQuery(ordersQueryOptions(pendingOrdersRequest));
  const allOrders = useQuery(ordersQueryOptions(allOrdersRequest));

  const activeCustomers = useQuery(
    customersQueryOptions(activeCustomersRequest)
  );

  return (
    <div className="flex flex-col gap-6 px-4 pt-4 pb-2">
      <h1 className="text-heading-lg font-semibold text-ink-heading">
        Overview
      </h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Pending orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-heading-md font-semibold text-ink-heading tabular-nums">
              {pendingOrders.isPending ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                (pendingOrders.data?.total ?? "—")
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>All orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-heading-md font-semibold text-ink-heading tabular-nums">
              {allOrders.isPending ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                (allOrders.data?.total ?? "—")
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-heading-md font-semibold text-ink-heading tabular-nums">
              {activeCustomers.isPending ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                (activeCustomers.data?.total ?? "—")
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="text-body-md text-ink-caption-1">
        Start from{" "}
        <Link className="underline underline-offset-4" to="/orders">
          orders
        </Link>{" "}
        or{" "}
        <Link className="underline underline-offset-4" to="/customers">
          customers
        </Link>
        . Set <code>localStorage.mockLatency = 8</code> to slow every request,
        or <code>localStorage.mockFail = &quot;orders&quot;</code> to fail them.
      </p>
    </div>
  );
};

export const Route = createFileRoute("/_app/")({
  // Prefetch, never await: the route renders immediately and each card
  // observes its own key.
  loader: ({ context }) => {
    prefetch(context.queryClient, ordersQueryOptions(pendingOrdersRequest));
    prefetch(context.queryClient, ordersQueryOptions(allOrdersRequest));
    prefetch(
      context.queryClient,
      customersQueryOptions(activeCustomersRequest)
    );
  },
  component: HomePage,
});
