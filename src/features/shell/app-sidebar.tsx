import { useQueries } from "@tanstack/react-query";
import {
  BookOpenIcon,
  HouseIcon,
  PackageIcon,
  PanelLeftIcon,
  UsersIcon,
} from "lucide-react";

import { customerQueryOptions } from "@/features/customers/queries";
import { useRecentlyViewed } from "@/features/customers/stores/recently-viewed";
import { SidebarLink } from "@/features/shell/sidebar-link";
import { Kbd } from "@/shared/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

/**
 * The app's navigation: 220px expanded, a 54.7px icon rail collapsed (widths
 * set on the provider in `routes/_app/route.tsx`).
 *
 * Chrome is one named module (`features/shell`), not a domain and not
 * `shared/`: it reads the customers store, and `shared/` must never import
 * from `features/`.
 *
 * Rows are `SidebarLink`s, so the router decides which is active
 * (`activeProps`) and hovering one preloads its route.
 */
export const AppSidebar = () => {
  const { toggleSidebar } = useSidebar();
  const recentIds = useRecentlyViewed((state) => state.customerIds);

  // One observer per id over the cache the profile pages fill, so a customer
  // you just viewed costs no request here.
  const recentCustomers = useQueries({
    queries: recentIds.map((customerId) => customerQueryOptions(customerId)),
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {/* Workspace row. Expanded: mark, name, and the collapse toggle
              beside them. Collapsed: the mark holds the rail's top slot and
              the toggle takes its place on hover. */}
          <div className="relative flex items-center gap-0.5">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:group-hover:invisible">
              <span className="flex size-5.5 shrink-0 items-center justify-center rounded-(--radius-sm) bg-primary text-caption-sm font-semibold text-primary-foreground">
                A
              </span>
              <span className="truncate text-body-md font-medium text-ink-heading group-data-[collapsible=icon]:hidden">
                Acme Inc
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    aria-label="Toggle sidebar"
                    className="flex w-9.5 shrink-0 items-center justify-center rounded-(--radius-sm) py-1.5 text-icon-3 outline-none group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:inset-y-0 group-data-[collapsible=icon]:left-0 group-data-[collapsible=icon]:group-hover:visible hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    onClick={toggleSidebar}
                    type="button"
                  />
                }
              >
                <PanelLeftIcon className="size-5.5 p-0.75" />
              </TooltipTrigger>
              <TooltipContent side="right">
                Toggle sidebar <Kbd>⌘B</Kbd>
              </TooltipContent>
            </Tooltip>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarLink
                activeOptions={{ exact: true }}
                activeProps={{ "data-active": true }}
                to="/"
                tooltip="Home"
              >
                <HouseIcon />
                <span>Home</span>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                activeProps={{ "data-active": true }}
                to="/orders"
                tooltip="Orders"
              >
                <PackageIcon />
                <span>Orders</span>
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink
                activeProps={{ "data-active": true }}
                to="/customers"
                tooltip="Customers"
              >
                <UsersIcon />
                <span>Customers</span>
              </SidebarLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {recentIds.length > 0 ? (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Recently viewed</SidebarGroupLabel>
            <SidebarMenu>
              {recentIds.map((customerId, index) => (
                <SidebarMenuItem key={customerId}>
                  <SidebarLink
                    activeProps={{ "data-active": true }}
                    params={{ customerId }}
                    size="sm"
                    to="/customers/$customerId"
                  >
                    <span>
                      {recentCustomers[index]?.data?.name ?? customerId}
                    </span>
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                // oxlint-disable-next-line react/jsx-no-target-blank -- rel is set; the rule cannot see through `render`.
                <a
                  aria-label="Documentation"
                  href="https://github.com/tobisamuel/frontend-scaffold#readme"
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              tooltip="Documentation"
            >
              <BookOpenIcon />
              <span>Documentation</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
