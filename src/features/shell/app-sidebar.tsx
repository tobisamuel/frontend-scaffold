import { useQueries } from "@tanstack/react-query";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { HouseIcon, PackageIcon, UsersIcon } from "lucide-react";

import { customerQueryOptions } from "@/features/customers/queries";
import { useRecentlyViewed } from "@/features/customers/stores/recently-viewed";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/components/ui/sidebar";

/**
 * The app's navigation. Chrome is one named module (`features/shell`), not a
 * domain and not `shared/`: it imports from domains (the recently-viewed
 * store), and `shared/` must never import from `features/`.
 */
export const AppSidebar = () => {
  const matchRoute = useMatchRoute();
  const recentIds = useRecentlyViewed((state) => state.customerIds);

  // One observer per id over the same cache the profile pages fill, so a
  // customer you just viewed costs no request here.
  const recentCustomers = useQueries({
    queries: recentIds.map((customerId) => customerQueryOptions(customerId)),
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/" />} size="lg">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground">
                FS
              </span>
              <span className="font-semibold">Frontend Scaffold</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={Boolean(matchRoute({ to: "/" }))}
                  render={<Link to="/" />}
                  tooltip="Home"
                >
                  <HouseIcon />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={Boolean(matchRoute({ fuzzy: true, to: "/orders" }))}
                  render={<Link to="/orders" />}
                  tooltip="Orders"
                >
                  <PackageIcon />
                  <span>Orders</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={Boolean(
                    matchRoute({ fuzzy: true, to: "/customers" })
                  )}
                  render={<Link to="/customers" />}
                  tooltip="Customers"
                >
                  <UsersIcon />
                  <span>Customers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {recentIds.length > 0 ? (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Recently viewed</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentIds.map((customerId, index) => (
                  <SidebarMenuItem key={customerId}>
                    <SidebarMenuButton
                      isActive={Boolean(
                        matchRoute({
                          fuzzy: true,
                          params: { customerId },
                          to: "/customers/$customerId",
                        })
                      )}
                      render={
                        <Link
                          params={{ customerId }}
                          to="/customers/$customerId"
                        />
                      }
                      size="sm"
                    >
                      <span>
                        {recentCustomers[index]?.data?.name ?? customerId}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
