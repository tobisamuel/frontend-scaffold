import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import {
  fetchCustomer,
  fetchCustomerOptions,
  fetchCustomers,
} from "@/features/customers/requests.mock";
import type { CustomersRequest } from "@/features/customers/schemas";
import { withoutUndefined } from "@/shared/lib/query-key";

/**
 * Query-options builders only; the only place a customers key is built.
 * See `features/orders/queries.ts` for the rules.
 */

export const customersQueryOptions = (request: CustomersRequest = {}) =>
  queryOptions({
    placeholderData: keepPreviousData,
    queryFn: () => fetchCustomers(request),
    queryKey: ["customers", "list", withoutUndefined(request)] as const,
  });

/** Every active customer, for the create-order picker. */
export const customerOptionsQueryOptions = () =>
  queryOptions({
    queryFn: fetchCustomerOptions,
    queryKey: ["customers", "options"] as const,
  });

export const customerQueryOptions = (customerId: string) =>
  queryOptions({
    queryFn: () => fetchCustomer(customerId),
    queryKey: ["customers", "detail", customerId] as const,
  });
