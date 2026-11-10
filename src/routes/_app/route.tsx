import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { CSSProperties } from "react";

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
  <SidebarProvider
    // 220px expanded, 54.7px rail: a 38px icon row plus the group's 8px
    // insets. Set on the provider rather than edited into the primitive.
    // SAFETY: React writes unknown `--*` style keys to the DOM unchanged; CSSProperties omits them.
    style={
      {
        "--sidebar-width": "13.75rem",
        "--sidebar-width-icon": "3.41875rem",
      } as CSSProperties
    }
  >
    <AppSidebar />
    <SidebarInset className="h-svh overflow-hidden">
      <SiteHeader />
      {/* The content stops growing at 1508px (a 16" screen minus the
          sidebar) and stays left-aligned. The cap sits inside the scroller,
          so the scrollbar stays at the window edge. */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex min-h-0 w-full max-w-377 flex-1 flex-col">
          <Outlet />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
);

export const Route = createFileRoute("/_app")({
  staticData: { crumb: "Home" },
  component: AppLayout,
});
