import type { badgeVariants } from "@/shared/components/ui/badge";

type BadgeVariant = NonNullable<Parameters<typeof badgeVariants>[0]>["variant"];

/**
 * How each customer status is shown. Keyed by the wire's own status values,
 * pinned with `satisfies` so a new status from the contract fails to compile
 * here instead of rendering a blank badge. The schema's enum is the
 * vocabulary; this is only its presentation.
 */
export const customerStatusMeta = {
  active: { label: "Active", variant: "secondary" },
  invited: { label: "Invited", variant: "outline" },
  suspended: { label: "Suspended", variant: "destructive" },
} as const satisfies Record<
  "active" | "invited" | "suspended",
  { label: string; variant: BadgeVariant }
>;
