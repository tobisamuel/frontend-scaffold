import { endOfDay, isWithinInterval, parseISO, startOfDay } from "date-fns";

import { SAMPLE_CUSTOMERS } from "@/features/customers/sample-data";
import type {
  Customer,
  CustomersPage,
  CustomersRequest,
} from "@/features/customers/schemas";
import { defaultCustomersSearch } from "@/features/customers/schemas";
import { SAMPLE_ORDERS } from "@/features/orders/sample-data";
import { fakeRequest } from "@/shared/dev/fake-api";

/**
 * The customers endpoints, answered from fixtures. Same seam as
 * `features/orders/requests.mock.ts`: a live `requests.ts` with these
 * signatures replaces it (docs/mocking.md).
 */

/** The server computes the count; the mock joins it from the order fixtures. */
const withOrderCount = (customer: Customer): Customer => ({
  ...customer,
  orders_count: SAMPLE_ORDERS.filter(
    (order) => order.customer_id === customer.id
  ).length,
});

const matchesCustomer = (customer: Customer, request: CustomersRequest) => {
  if (request.status && customer.status !== request.status) {
    return false;
  }

  if (!request.created) {
    return true;
  }

  return isWithinInterval(parseISO(customer.created_at), {
    end: endOfDay(parseISO(request.created.to)),
    start: startOfDay(parseISO(request.created.from)),
  });
};

/** `GET customers?status&created&limit&offset` */
export const fetchCustomers = (
  request: CustomersRequest
): Promise<CustomersPage> =>
  fakeRequest("GET customers", () => {
    const limit = request.limit ?? defaultCustomersSearch.limit;
    const offset = request.offset ?? defaultCustomersSearch.offset;

    const matches = SAMPLE_CUSTOMERS.filter((customer) =>
      matchesCustomer(customer, request)
    );

    return {
      items: matches.slice(offset, offset + limit).map(withOrderCount),
      total: matches.length,
    };
  });

/**
 * `GET customers/options`: every active customer, unpaginated, for pickers.
 * A real API usually has a search-as-you-type endpoint for this instead.
 */
export const fetchCustomerOptions = (): Promise<Customer[]> =>
  fakeRequest("GET customers/options", () =>
    SAMPLE_CUSTOMERS.filter((customer) => customer.status === "active")
  );

/** `GET customers/:id`. An unknown id answers `null` (see `fetchOrder`). */
export const fetchCustomer = (customerId: string): Promise<Customer | null> =>
  fakeRequest("GET customers/:id", () => {
    const customer = SAMPLE_CUSTOMERS.find(
      (candidate) => candidate.id === customerId
    );

    return customer ? withOrderCount(customer) : null;
  });
