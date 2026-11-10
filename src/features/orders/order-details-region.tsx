import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";

import { CancelOrderFlow } from "@/features/orders/cancel-order-flow";
import {
  CANCELLABLE_ORDER_STATUSES,
  orderStatusMeta,
} from "@/features/orders/constants";
import { OrderDetailsSkeleton } from "@/features/orders/order-details-skeleton";
import { orderQueryOptions } from "@/features/orders/queries";
import { TableError } from "@/shared/components/data-table/table-error";
import { Badge } from "@/shared/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { formatMoney } from "@/shared/lib/format";

/**
 * The order sheet's body: its read and every outcome of it, drawn inside the
 * sheet chrome the route owns. Two routes open this sheet (the orders list and
 * a customer's Orders tab), so the body is a leaf of the orders module and
 * each route composes its own `<Sheet>` around it.
 *
 * Every state renders inside the open sheet: pending is a skeleton, a failed
 * read is a retry, and an unknown id is "not found". None of them replace the
 * list behind it.
 */
export const OrderDetailsRegion = ({ orderId }: { orderId: string }) => {
  const {
    data: order,
    isError,
    isPending,
    refetch,
  } = useQuery(orderQueryOptions(orderId));

  if (isPending) {
    return <OrderDetailsSkeleton />;
  }

  if (isError) {
    return (
      <TableError onRetry={refetch} title="We could not load this order" />
    );
  }

  if (!order) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Order not found</EmptyTitle>
          <EmptyDescription>
            It may have been removed, or the link may be wrong.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-heading-md font-semibold text-ink-heading tabular-nums">
          {formatMoney(order.total, order.currency)}
        </p>
        <Badge variant={orderStatusMeta[order.status].variant}>
          {orderStatusMeta[order.status].label}
        </Badge>
      </div>

      <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-3 text-body-md">
        <dt className="text-ink-caption-1">Order</dt>
        <dd>{order.number}</dd>
        <dt className="text-ink-caption-1">Customer</dt>
        <dd>
          <Link
            className="underline-offset-4 hover:underline"
            params={{ customerId: order.customer_id }}
            to="/customers/$customerId"
          >
            {order.customer_name}
          </Link>
        </dd>
        <dt className="text-ink-caption-1">Items</dt>
        <dd>{order.items_count}</dd>
        <dt className="text-ink-caption-1">Created</dt>
        <dd>{format(parseISO(order.created_at), "MMM d, yyyy, h:mm a")}</dd>
        <dt className="text-ink-caption-1">Cancelled</dt>
        <dd>
          {order.cancelled_at
            ? format(parseISO(order.cancelled_at), "MMM d, yyyy, h:mm a")
            : "—"}
        </dd>
        <dt className="text-ink-caption-1">Note</dt>
        <dd>{order.note ?? "—"}</dd>
      </dl>

      {CANCELLABLE_ORDER_STATUSES.includes(order.status) ? (
        <div className="mt-auto flex justify-end pb-4">
          <CancelOrderFlow order={order} />
        </div>
      ) : null}
    </div>
  );
};
