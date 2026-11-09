# Frontend Scaffold

A React SPA starter for agentic coding: a current stack, a working mocked domain that exercises every pattern, and the rules written down where an agent will read them.

**Stack:** Vite 8 · React 19 + React Compiler · TypeScript 6 · TanStack Router, Query and Table v9 · React Hook Form + zod 4 · zustand (when needed) · shadcn/ui on Base UI · Tailwind CSS v4 · ky · date-fns · Ultracite (oxlint + oxfmt)

## Start

```sh
bun install
bun run dev        # http://localhost:3000
```

There's no backend. Every request is answered from seeded fixtures behind a fake network ([docs/mocking.md](docs/mocking.md)). Try these from the browser console:

```js
localStorage.mockLatency = "8"; // slow every request to watch skeletons
localStorage.mockFail = "GET orders"; // fail matching requests to see error states
```

## What the demo covers

| Where | Pattern |
| --- | --- |
| `/orders` | Server-paginated table, URL filters with chips, row → sheet with loading inside it, row-menu confirmation as a route, `/orders/new` create sheet |
| `/orders/new` | Form with data passed in as props, resolver-inferred types, submit validation, a live credit-limit bound, inline mutation |
| `/customers/$id` | Page sibling of its list, breadcrumb label read from the query, route tabs, the orders table reused under a customer |
| Sidebar "Recently viewed" | The one zustand store, and why it clears the bar |
| Home | Independent cards, each with its own pending state |

## Docs

Read these before changing the matching area. `AGENTS.md` points agents to them.

- [architecture.md](docs/architecture.md): where files go, the feature spine, what earns a component
- [routing.md](docs/routing.md): the route tree, loaders, search params, breadcrumbs
- [data-loading.md](docs/data-loading.md): query options, keys, prefetch, mutations
- [loading-and-errors.md](docs/loading-and-errors.md): every surface's pending, error and empty states
- [forms.md](docs/forms.md): RHF + zod + Field, validation layers, filters
- [overlays.md](docs/overlays.md): when a sheet or dialog is a route
- [tables.md](docs/tables.md): Table v9 setup, region/table split, the filter registry
- [state.md](docs/state.md): which owner each kind of state has
- [mocking.md](docs/mocking.md): the request seam and how to go live
- [conventions.md](docs/conventions.md): dates, styling, TypeScript, comments
- [tooling.md](docs/tooling.md): scripts, React Compiler, devtools, the Ultracite routine

## Starting a real project from this

1. Delete `features/customers` and `features/orders` and their routes, or keep them as reference until your first feature exists.
2. Add a feature by copying the spine in [architecture.md](docs/architecture.md): schemas, then `requests.mock.ts`, then queries, then routes.
3. Point `VITE_API_URL` at your API (`.env.example`) and replace mock files one at a time.
