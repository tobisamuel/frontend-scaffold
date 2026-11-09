import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { tableDevtoolsPlugin } from "@tanstack/react-table-devtools";

/**
 * One devtools shell, three panels: where you are (router), what it fetched
 * (query), what the table did with it (table). Each tool contributes a panel
 * to the unified shell instead of floating its own widget. Ctrl+~ opens it;
 * `devtools()` in vite.config.ts strips it from production builds.
 */
const RootComponent = () => (
  <>
    <Outlet />
    <TanStackDevtools
      config={{
        hideUntilHover: true,
        position: "bottom-right",
        triggerMode: "fixed",
      }}
      plugins={[
        { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> },
        { name: "TanStack Query", render: <ReactQueryDevtoolsPanel /> },
        // Every table registers itself through `useAppTable` by its `key`.
        tableDevtoolsPlugin(),
      ]}
    />
  </>
);

/**
 * The query client reaches every loader through router context, so a
 * loader's prefetch and a component's `useQuery` are provably the same
 * client. `createRootRouteWithContext` carries the type down; without it
 * `context` is `{}` in every loader.
 */
export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
