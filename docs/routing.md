# Routing

TanStack Router with file-based routes under `src/routes/`, code-split automatically. The rules below come from the router's own semantics and from two failures already paid for in production apps. Verify a claim against the router source before relying on it; a pulled copy is the fastest way to read one.

## The fact everything follows from

**A parent route's render owns everything below it.** Its `<Outlet/>` is where children appear, and whatever the parent does while loading or failing, it does to its children too. Both failures below are this one fact seen from two sides.

- **The list vanished when its sheet opened.** The rows were in `index.tsx` and the sheet beside it, which made them siblings, so navigating to the sheet unmounted the rows.
- **The layout blanked when a child navigated.** The parent's loader was awaited, so every child navigation put the parent back into pending, and its fallback replaced the header, tabs and list together.

## Rules

1. **A sheet or dialog is a child of the route whose rows it floats over, and that route renders `<Outlet/>`.** The list lives in `orders/route.tsx`; the sheet is `orders/$orderId/index.tsx` beneath it.
2. **A page is a sibling of the list it came from, under a shared ancestor.** `/customers` and `/customers/$customerId` are two pages, so opening a profile should unmount the table. They share `customers/route.tsx`.
3. **An ancestor that owns no UI declares no component.** The router renders a bare `<Outlet/>`. `customers/route.tsx` exists only to be a breadcrumb node, and `orders/$orderId/route.tsx` exists to share one prefetch between the sheet and the cancel confirmation, which are siblings.
4. **An index leaf is required under a pathless parent and redundant under a path parent.** `_app/index.tsx` is what matches `/`; delete it and the home page blanks.
5. **Directories, not dots.** `orders/$orderId/cancel.tsx`, never `orders.$orderId.cancel.tsx`. The directory shows the nesting and leaves an obvious place for the next child.
6. **Loaders prefetch; they never await.** `prefetch(context.queryClient, xQueryOptions(deps))` starts the request and returns, so a route never enters pending for data and can never blank its layout. The component reads the same key with `useQuery`. Await only a true prerequisite such as auth, and look at what that does to every child first.
7. **Boundaries go inside the chrome, never around it.** Pending, error and not-found states render inside the sheet, table or panel that was waiting, not in place of the route. See [loading-and-errors.md](loading-and-errors.md).
8. **No `defaultPendingComponent`.** A pending child match renders its fallback in the parent's `<Outlet/>`, and a page-sized spinner there squeezes the list behind a sheet to nothing. Rule 6 means routes rarely pend; when one does, nothing is better than the wrong thing.
9. **Route options go in TanStack's order:** `validateSearch`, `search`, `staticData`, `loaderDeps`, `loader`, `onEnter`, `component`. TypeScript infers top to bottom, so `loader` above `loaderDeps` types `deps` as `{}`. The tanstack lint preset turns `sort-keys` off for this reason.
10. **`suffix_` is a last resort.** It detaches a route from its parent's render tree and drops its URL ancestor out of the breadcrumb trail. Rule 2 does the same job and keeps the trail.
11. **Create is a route.** `/orders/new`, never `?create=true` on the list. See [overlays.md](overlays.md).

## Search params

- Each list declares a zod search schema: filters (registered for chips, see [tables.md](tables.md)) plus `paginationParamsSchema`. `validateSearch: schema`, with `stripSearchParams(defaults)` so the URL reads `/orders`, not `/orders?limit=25&offset=0`.
- A date range is one field, `{ from, to }` as ISO date strings, never a `from_date`/`to_date` pair.
- Write search functionally, `search: (previous) => ({ ...previous, ...patch })`, so a patch merges into the router's current search rather than a copy captured at render.
- One `updateSearch` sink per list serves Apply, chip removal, Clear and paging. A filter change resets `offset` to 0; a page change carries its own.
- Single-route consumers read their route through `Route.useSearch()` in the route file or `getRouteApi("/_app/customers/")` elsewhere. A leaf drawn by two routes takes search and callbacks as props instead (`OrdersTableRegion`).

## Breadcrumbs

The trail is the router's match chain (`shared/hooks/use-breadcrumbs.ts`). A route opts in with `staticData: { crumb: "Orders" }`, or a label component that observes the query naming the record (`CustomerBreadcrumb`). A route with no crumb is not in the trail, which is how sheets drop out. The href is the match's own `pathname`; never rebuild it. A missing crumb is fixed with a better tree (rule 2), never a per-page breadcrumb hook.

## Overlay chunk preloading

Rows open sheets with `onClick`, not `<Link>`, so hover preloading never fetches a sheet's code-split chunk, and the router can't render a match until its chunk arrives. On a slow connection the click waited on the download. `src/router.tsx` fixes this by subscribing to `onResolved` and loading the chunks of every route up to two levels below the current page. The click then mounts the sheet immediately and only the data loads inside it. Don't remove this, and don't fix the same symptom with a per-route sheet-shaped `pendingComponent`: that is a different `<Sheet>` instance, and its slide-in plays twice.
