import { endOfDay, isWithinInterval, parseISO, startOfDay } from "date-fns";

import { SAMPLE_CUSTOMERS } from "@/features/customers/sample-data";
import { CANCELLABLE_ORDER_STATUSES } from "@/features/orders/constants";
import { SAMPLE_ORDERS } from "@/features/orders/sample-data";
import type {
  CreateOrderValues,
  Order,
  OrdersPage,
  OrdersRequest,
} from "@/features/orders/schemas";
import { defaultOrdersSearch } from "@/features/orders/schemas";
import { fakeRequest } from "@/shared/dev/fake-api";
import { FIXTURE_NOW } from "@/shared/dev/fixtures";

/**
 * The orders endpoints, answered from fixtures. Each function is the request:
 * its arguments are what the live call would send and its return is what the
 * server would answer, so filtering and paging live here, not in components.
 *
 * Going live means writing `requests.ts` with these same signatures against
 * `shared/api/client.ts` and changing the import in `queries.ts` (and in the
 * routes and components that call a write). Nothing else moves.
 */

const matchesOrder = (order: Order, request: OrdersRequest) => {
  if (request.customerId && order.customer_id !== request.customerId) {
    return false;
  }

  if (request.status && order.status !== request.status) {
    return false;
  }

  if (!request.created) {
    return true;
  }

  return isWithinInterval(parseISO(order.created_at), {
    end: endOfDay(parseISO(request.created.to)),
    start: startOfDay(parseISO(request.created.from)),
  });
};

/** `GET orders?status&created&customer_id&limit&offset` */
export const fetchOrders = (request: OrdersRequest): Promise<OrdersPage> =>
  fakeRequest("GET orders", () => {
    const limit = request.limit ?? defaultOrdersSearch.limit;
    const offset = request.offset ?? defaultOrdersSearch.offset;

    const matches = SAMPLE_ORDERS.filter((order) =>
      matchesOrder(order, request)
    );

    return {
      items: matches.slice(offset, offset + limit),
      total: matches.length,
    };
  });

/**
 * `GET orders/:id`. A missing record answers `null` rather than throwing: an
 * unknown id is a state of the detail sheet ("not found" inside its chrome),
 * not a failed request. The live version maps a 404 to `null` the same way.
 */
export const fetchOrder = (orderId: string): Promise<Order | null> =>
  fakeRequest(
    "GET orders/:id",
    () => SAMPLE_ORDERS.find((order) => order.id === orderId) ?? null
  );

/** `POST orders` */
export const createOrder = (values: CreateOrderValues): Promise<Order> =>
  fakeRequest("POST orders", () => {
    const customer = SAMPLE_CUSTOMERS.find(
      (candidate) => candidate.id === values.customerId
    );

    if (!customer) {
      throw new Error("That customer no longer exists");
    }

    const order: Order = {
      cancelled_at: null,
      created_at: FIXTURE_NOW.toISOString(),
      currency: "USD",
      customer_id: customer.id,
      customer_name: customer.name,
      id: `ord_new${String(SAMPLE_ORDERS.length)}`,
      items_count: 1,
      note: values.note || null,
      number: `ORD-${String(1000 + SAMPLE_ORDERS.length)}`,
      status: "pending",
      total: values.amount,
    };

    SAMPLE_ORDERS.unshift(order);

    return order;
  });

/**
 * `POST orders/:id/cancel`. The server is the authority on whether an order
 * can still be cancelled (layer C in docs/forms.md): it refuses with a
 * message, and the client shows that message rather than re-deriving it.
 */
export const cancelOrder = (orderId: string): Promise<Order> =>
  fakeRequest("POST orders/:id/cancel", () => {
    const order = SAMPLE_ORDERS.find((candidate) => candidate.id === orderId);

    if (!order) {
      throw new Error("This order no longer exists");
    }

    if (!CANCELLABLE_ORDER_STATUSES.includes(order.status)) {
      throw new Error(`A ${order.status} order can no longer be cancelled`);
    }

    order.status = "cancelled";
    order.cancelled_at = FIXTURE_NOW.toISOString();

    return order;
  });
