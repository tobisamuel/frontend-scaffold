import type { badgeVariants } from "@/shared/components/ui/badge";

type BadgeVariant = NonNullable<Parameters<typeof badgeVariants>[0]>["variant"];

/**
 * How each order status is shown, keyed by the wire's status values and
 * pinned with `satisfies` so a new contract status fails here at compile time.
 */
export const orderStatusMeta = {
  cancelled: { label: "Cancelled", variant: "destructive" },
  delivered: { label: "Delivered", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  processing: { label: "Processing", variant: "outline" },
  shipped: { label: "Shipped", variant: "secondary" },
} as const satisfies Record<
  "cancelled" | "delivered" | "pending" | "processing" | "shipped",
  { label: string; variant: BadgeVariant }
>;

/**
 * Statuses an order can still be cancelled from. The server is the authority
 * (it re-checks and refuses); the client uses this only to hide an action
 * that cannot succeed.
 */
export const CANCELLABLE_ORDER_STATUSES: readonly string[] = [
  "pending",
  "processing",
];
