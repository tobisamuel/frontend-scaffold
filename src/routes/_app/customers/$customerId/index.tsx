import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";

import { customerQueryOptions } from "@/features/customers/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatMoney } from "@/shared/lib/format";

/**
 * The profile's Overview tab. It observes the same customer query as the
 * layout above it: two observers, one key, one request. The layout already
 * renders the failed and not-found states, so this tab only draws the record
 * or its skeleton.
 */
const CustomerOverview = () => {
  const { customerId } = Route.useParams();
  const { data: customer } = useQuery(customerQueryOptions(customerId));

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        {customer ? (
          <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-3 text-body-md">
            <dt className="text-ink-caption-1">Email</dt>
            <dd>{customer.email}</dd>
            <dt className="text-ink-caption-1">Company</dt>
            <dd>{customer.company}</dd>
            <dt className="text-ink-caption-1">Country</dt>
            <dd>{customer.country}</dd>
            <dt className="text-ink-caption-1">Credit limit</dt>
            <dd className="tabular-nums">
              {formatMoney(customer.credit_limit, "USD")}
            </dd>
            <dt className="text-ink-caption-1">Orders</dt>
            <dd className="tabular-nums">{customer.orders_count}</dd>
            <dt className="text-ink-caption-1">Joined</dt>
            <dd>{format(parseISO(customer.created_at), "MMM d, yyyy")}</dd>
          </dl>
        ) : (
          <div aria-busy className="flex flex-col gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton className="h-4 w-64" key={index} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Route = createFileRoute("/_app/customers/$customerId/")({
  component: CustomerOverview,
});
