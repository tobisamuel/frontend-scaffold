import { createFileRoute } from "@tanstack/react-router";

/**
 * `/customers`: an ancestor that owns no UI, so it declares no component and
 * the router renders a bare `<Outlet/>`.
 *
 * The list (`index.tsx`) and a profile (`$customerId/`) are two pages, so
 * they are siblings: opening a profile should unmount the table. Sharing this
 * ancestor keeps "Customers" in the breadcrumb trail of both, which a
 * detached `customers_` route would lose (docs/routing.md).
 */
export const Route = createFileRoute("/_app/customers")({
  staticData: { crumb: "Customers" },
});
