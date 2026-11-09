import { createRouter } from "@tanstack/react-router";
import type { AnyRoute } from "@tanstack/react-router";

import { queryClient } from "@/shared/api/query-client";
import { RouteErrorPanel } from "@/shared/components/route-error-panel";
import { RouteNotFoundPanel } from "@/shared/components/route-not-found-panel";

import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  context: { queryClient },
  // Rendered in place of the route that threw, inside its parent's chrome.
  defaultErrorComponent: RouteErrorPanel,
  // Fuzzy mode draws this inside the nearest matched layout, keeping chrome.
  defaultNotFoundComponent: RouteNotFoundPanel,
  // No defaultPendingComponent, on purpose. A pending child match renders its
  // fallback in the parent's <Outlet/>, and a page-sized spinner there
  // squeezes the list behind a sheet to nothing. Loaders prefetch instead of
  // awaiting, so routes do not enter pending for data (docs/data-loading.md).
  defaultPreload: "intent",
  // Let Query decide freshness: the router always re-runs loaders on
  // preload, and the loaders only prefetch into Query's cache.
  defaultPreloadStaleTime: 0,
  // No defaultStructuralSharing: it requires JSON-serialisable selector
  // results, and a breadcrumb label can be a component.
  routeTree,
  scrollRestoration: true,
});

/**
 * Rows open sheets and confirmations with `onClick`, not `<Link>`, so intent
 * preloading never fetches those routes' component chunks, and the router
 * cannot render a match until its chunk arrives (router-core `load-client.ts`:
 * a route is renderable only once its data and component chunk are ready).
 * On a slow connection the click waited seconds before the sheet appeared.
 *
 * So once a page resolves, fetch the chunks of the overlays it can open:
 * every route up to two levels below it. Only chunks: loaders still run on
 * navigation, so this is cheap.
 */
const OVERLAY_PRELOAD_DEPTH = 2;

router.subscribe("onResolved", () => {
  const leaf = router.state.matches.at(-1);

  if (!leaf) {
    return;
  }

  const leafRoute: AnyRoute = router.routesById[leaf.routeId];
  // An index leaf is the page's own body; its overlays hang off the parent.
  const page = leafRoute.path === "/" ? leafRoute.parentRoute : leafRoute;

  if (!page || page.fullPath === "/") {
    return;
  }

  const visit = (route: AnyRoute, depth: number) => {
    for (const child of route.children ?? []) {
      void router.loadRouteChunk(child);

      if (depth < OVERLAY_PRELOAD_DEPTH) {
        visit(child, depth + 1);
      }
    }
  };

  visit(page, 1);
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
