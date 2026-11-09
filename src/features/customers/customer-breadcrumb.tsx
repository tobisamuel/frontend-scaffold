import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { customerQueryOptions } from "@/features/customers/queries";
import type { BreadcrumbLabelProps } from "@/shared/lib/breadcrumbs";

/**
 * The profile route's crumb. It observes the same query the profile header
 * reads, so renaming a customer updates both through one invalidation, and
 * the loader never copies the name into router state. While the read is in
 * flight, or if it fails, the crumb falls back to the id in the URL.
 *
 * `strict: false` rather than `getRouteApi(...)`: the profile route imports
 * this component for its `staticData`, so typing it from that route would be
 * a circular type. The crumb only renders while that route is matched, so the
 * param is always present.
 */
// Annotated at the declaration so the route tree's types do not loop through
// this component's inferred return type.
export const CustomerBreadcrumb: ComponentType<BreadcrumbLabelProps> = ({
  children,
}) => {
  const { customerId = "" } = useParams({ strict: false });
  const { data } = useQuery(customerQueryOptions(customerId));

  return children(data?.name ?? customerId);
};
