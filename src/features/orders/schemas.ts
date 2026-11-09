import * as z from "zod";

import { orderStatusMeta } from "@/features/orders/constants";
import { dateRangeSchema, formatDateRange } from "@/shared/lib/date-range";
import { filterMeta } from "@/shared/lib/filters";
import { paginationParamsSchema } from "@/shared/lib/table/table-options";

export const orderStatusEnum = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export type OrderStatus = z.infer<typeof orderStatusEnum>;

/** One order as the API sends it. */
export const orderSchema = z.object({
  cancelled_at: z.iso.datetime().nullable(),
  created_at: z.iso.datetime(),
  currency: z.literal("USD"),
  customer_id: z.string(),
  customer_name: z.string(),
  id: z.string(),
  items_count: z.number().int(),
  note: z.string().nullable(),
  number: z.string(),
  status: orderStatusEnum,
  total: z.number(),
});

export type Order = z.infer<typeof orderSchema>;

export const ordersPageSchema = z.object({
  items: z.array(orderSchema),
  total: z.number().int(),
});

export type OrdersPage = z.infer<typeof ordersPageSchema>;

/**
 * The orders filters, shared by the top-level list and a customer's Orders
 * tab: the entity owns its URL contract wherever it is drawn.
 */
export const ordersFilterSchema = z.object({
  created: dateRangeSchema.optional().register(filterMeta, {
    format: (value) => formatDateRange(value),
    label: "Created",
  }),
  status: orderStatusEnum.optional().register(filterMeta, {
    format: (value) => (value ? orderStatusMeta[value].label : null),
    label: "Status",
  }),
});

export type OrdersFilterValues = z.infer<typeof ordersFilterSchema>;

export const ordersSearchSchema = z.object({
  ...ordersFilterSchema.shape,
  ...paginationParamsSchema.shape,
});

export type OrdersSearch = z.infer<typeof ordersSearchSchema>;

export const ordersSearchFields = ordersSearchSchema.shape;

export const defaultOrdersSearch: OrdersSearch = ordersSearchSchema.parse({});

/**
 * What the list request accepts: the URL contract, optionally scoped to one
 * customer. Partial, so `ordersQueryOptions()` is every page's key prefix.
 */
export type OrdersRequest = Partial<OrdersSearch> & { customerId?: string };

/**
 * The create form. Only shape rules live here (layer A in docs/forms.md).
 * The credit-limit bound needs the chosen customer's record, so it is a pure
 * function in `lib/credit.ts`, not a refine closed over fetched data.
 *
 * `amount` is `z.number()` with one message for every failure, including the
 * empty field: the input writes `undefined` when cleared, never `""`, so
 * there is no string step for coercion to trip over.
 */
export const createOrderSchema = z.object({
  amount: z
    .number({ error: "Enter an amount" })
    .positive("Amount must be more than zero"),
  customerId: z
    .string({ error: "Choose a customer" })
    .min(1, "Choose a customer"),
  note: z.string().trim().max(280, "Keep the note under 280 characters"),
});

export type CreateOrderValues = z.infer<typeof createOrderSchema>;
