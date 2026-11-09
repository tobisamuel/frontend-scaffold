import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { fetchOrder, fetchOrders } from "@/features/orders/requests.mock";
import type { OrdersRequest } from "@/features/orders/schemas";
import { withoutUndefined } from "@/shared/lib/query-key";

/**
 * Query-options builders, and nothing else (docs/data-loading.md):
 *
 * - **They are the only place a key is built.** Invalidations read
 *   `ordersQueryOptions().queryKey` (every list page) or
 *   `orderQueryOptions(id).queryKey` (one record). No hand-written key arrays,
 *   no key factories, no `queryKey[0]` slices.
 * - **No mutation hooks here.** A mutation is written inline with
 *   `useMutation` where it is triggered, in the component or route that owns
 *   the outcome.
 */

/**
 * A page of orders. `keepPreviousData` keeps the previous page on screen while
 * the next loads, so the table's skeleton only shows on first load. It only
 * works with `useQuery`: `useSuspenseQuery` overrides `placeholderData`.
 */
export const ordersQueryOptions = (request: OrdersRequest = {}) =>
  queryOptions({
    placeholderData: keepPreviousData,
    queryFn: () => fetchOrders(request),
    queryKey: ["orders", "list", withoutUndefined(request)] as const,
  });

/** One order, for its detail sheet. `null` means the id is unknown. */
export const orderQueryOptions = (orderId: string) =>
  queryOptions({
    queryFn: () => fetchOrder(orderId),
    queryKey: ["orders", "detail", orderId] as const,
  });
