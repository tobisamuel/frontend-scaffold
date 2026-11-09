import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppSidebar } from "@/features/shell/app-sidebar";
import { SiteHeader } from "@/features/shell/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

/**
 * The pathless app layout: sidebar, header and the outlet every page renders
 * into. Pathless (`_app`), so it adds no URL segment; it matches at `/` and
 * declares the leading "Home" crumb, which makes the first crumb a real match
 * rather than a constant.
 *
 * Under a pathless parent an index leaf is required: `_app/index.tsx` is what
 * matches `/` exactly. Delete it and `/` blanks.
 */
const AppLayout = () => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset className="h-svh overflow-hidden">
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </SidebarInset>
  </SidebarProvider>
);

export const Route = createFileRoute("/_app")({
  staticData: { crumb: "Home" },
  component: AppLayout,
});
