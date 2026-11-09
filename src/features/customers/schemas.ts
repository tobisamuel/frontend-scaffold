import * as z from "zod";

import { customerStatusMeta } from "@/features/customers/constants";
import { dateRangeSchema, formatDateRange } from "@/shared/lib/date-range";
import { filterMeta } from "@/shared/lib/filters";
import { paginationParamsSchema } from "@/shared/lib/table/table-options";

/**
 * Wire, URL and form schemas for the customers domain, and the types inferred
 * from them. Types are never written by hand next to a schema: the schema is
 * the contract and the type follows it.
 */

export const customerStatusEnum = z.enum(["active", "invited", "suspended"]);

export type CustomerStatus = z.infer<typeof customerStatusEnum>;

/**
 * One customer as the API sends it. Field names are the wire's (snake_case);
 * renaming them in a mapper layer would mean two names for one field.
 */
export const customerSchema = z.object({
  company: z.string(),
  country: z.string(),
  created_at: z.iso.datetime(),
  credit_limit: z.number(),
  email: z.email(),
  id: z.string(),
  name: z.string(),
  orders_count: z.number().int(),
  status: customerStatusEnum,
});

export type Customer = z.infer<typeof customerSchema>;

export const customersPageSchema = z.object({
  items: z.array(customerSchema),
  total: z.number().int(),
});

export type CustomersPage = z.infer<typeof customersPageSchema>;

/**
 * The list's filters. Each is declared once on its field with `.register()`,
 * which must stay last in the chain, so the chip row, the popover heading and
 * Clear all read one label and one "is this set?" answer.
 */
export const customersFilterSchema = z.object({
  created: dateRangeSchema.optional().register(filterMeta, {
    format: (value) => formatDateRange(value),
    label: "Joined",
  }),
  status: customerStatusEnum.optional().register(filterMeta, {
    format: (value) => (value ? customerStatusMeta[value].label : null),
    label: "Status",
  }),
});

export type CustomersFilterValues = z.infer<typeof customersFilterSchema>;

/** The list's full URL contract: its filters plus pagination. */
export const customersSearchSchema = z.object({
  ...customersFilterSchema.shape,
  ...paginationParamsSchema.shape,
});

export type CustomersSearch = z.infer<typeof customersSearchSchema>;

export const customersSearchFields = customersSearchSchema.shape;

export const defaultCustomersSearch: CustomersSearch =
  customersSearchSchema.parse({});

/**
 * What the list request accepts. Partial, so `customersQueryOptions()` with no
 * argument is the key prefix of every page (`shared/lib/query-key.ts`).
 */
export type CustomersRequest = Partial<CustomersSearch>;
