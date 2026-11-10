import { createLink } from "@tanstack/react-router";
import type { ComponentProps } from "react";

import { SidebarMenuButton } from "@/shared/components/ui/sidebar";

/**
 * A sidebar row that is a real router link: typed `to`/`params`, intent
 * preloading on hover, and `activeProps` from the router's own matching
 * instead of a hand-rolled `matchRoute` per item. `createLink` adapts the
 * shadcn button to the router's link contract.
 */
export const SidebarLink = createLink(
  (props: ComponentProps<typeof SidebarMenuButton>) => (
    // `createLink` supplies `href` at runtime; the rule cannot see it.
    // oxlint-disable-next-line jsx-a11y/anchor-is-valid
    <SidebarMenuButton render={<a />} {...props} />
  )
);
