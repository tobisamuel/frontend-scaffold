# Architecture

Where a file goes, what it may contain and what it may import. Routing has its own doc ([routing.md](routing.md)); this one covers everything the routes compose from.

## Three questions place every file

1. **What kind of thing is it?** That decides its slot (below). A file holds one kind of thing.
2. **Whose domain is it?** That decides its module: the entity the code is about, not the screen it was first drawn on.
3. **How shared is it?** One module's code lives in that module. Domain-free code used by two or more modules lives in `shared/`. Domain-bound code used by two or more modules stays in the owning module and is imported from its named slot.

An entity drawn in two places belongs to the entity. Orders appear at `/orders` and inside a customer's profile, and `features/orders/` owns both: the columns, the table, the URL contract and the sheet body. The customer route composes those leaves with a `customerId`.

## The tree

```
src/
├── main.tsx · router.tsx · routeTree.gen.ts · index.css
├── routes/                 composition only (routing.md)
├── features/
│   ├── shell/              app chrome: sidebar, header. The one non-domain module.
│   ├── customers/
│   └── orders/
└── shared/                 domain-free, imported by 2+ modules
    ├── api/                client.ts (ky), query-client.ts (+ prefetch)
    ├── config/             env.ts
    ├── dev/                fake-api.ts, fixtures.ts  (delete when fully live)
    ├── hooks/
    ├── lib/                filters, date-range, format, query-key, table/
    ├── components/         data-table/, active-filters, route panels
    │   └── ui/             vendored shadcn primitives, not ours to reshape
    └── theme/              tokens.css (the design tokens), theme-provider
```

`shared/` never imports from `features/` or `routes/`. When a "shared" helper needs a domain type, it is not shared; move it to the domain. App chrome is `features/shell/` rather than `shared/` for this reason: the sidebar reads the customers store.

## The feature spine

```
features/<domain>/
├── schemas.ts            zod: wire, URL search, forms, and their inferred types
├── constants.ts          static data the domain has: status metas, option lists
├── queries.ts            queryOptions builders, and nothing else
├── requests.mock.ts      the endpoints, answered from fixtures (mocking.md)
├── sample-data.ts        fixtures, only while mocked
├── lib/<topic>.ts        pure domain logic, one topic per file
├── stores/<topic>.ts     zustand stores, only when state.md's bar is cleared
├── <name>-columns.tsx    table column defs, always their own file
├── <name>-table-region.tsx   the read in front of a table (tables.md)
├── <name>-table.tsx      the loaded table
├── <name>-filter.tsx     the filter popover
└── <flow>.tsx            one component per file
```

A module only has the slots it needs. When something exists, it lives in its named slot and is named for what it is. A helper defined inside a component file, or a constant hoisted into a route file, is out of its slot.

## Rules that keep files predictable

**No barrel files.** Import by file path: `@/features/orders/queries`, never `@/features/orders`. A barrel gives one module two names and hides what an import actually pulls in.

**A component earns a file, or it is written inline.** If something deserves to be a component, it deserves its own file. If it doesn't, write the markup where it is drawn. A private helper component above the one that uses it is the unearned split with nowhere to go, and it grows props to stay general enough for one caller. The usual offenders are the row component extracted from a `.map()`, the `Frame`/`Shell` wrapper that is a card plus a heading plus children, and the `const ROWS = [...]` invented so three blocks can be mapped instead of written out. Length alone never justifies a split. A split needs an independent concern, a data or hook boundary, or a real interface. `shared/components/ui/` is the only folder this rule doesn't reach.

**Abstract on repetition, not before.** Two filter popovers in this repo are written out in full (`orders-filter.tsx`, `customers-filter.tsx`). A third, with the same shape, is the point to extract one, and then you extract the whole flow, trigger included.

**A flow is extracted with its trigger.** When a dialog repeats, the unit is the trigger plus the dialog plus the mutation (`CancelOrderFlow`). Never extract the surrounding chrome, such as a footer, and leave the dialog wired to it by state.

**Types come from schemas.** `type Order = z.infer<typeof orderSchema>`. Never hand-write a type next to the schema that already describes it, and never write a mapper that renames wire fields into a second vocabulary. Wire names (snake_case) are used as-is.

**Class names are written inline, in full.** No `const LABEL_CLASS = "..."`, no class strings exported for reuse. A primitive's variants live in its own `cva` or `data-*` attributes; share markup through a component, never through a string.

## Props

**A prop must carry something the component cannot get for itself.** The test: delete the prop, and if the component could still do the right thing through the router, Query, a store or context, the prop was never earned. The route is not the only thing allowed to read the router.

| Earned | Not earned |
| --- | --- |
| A record or identity the caller already holds and the child cannot look up: `order` on `CancelOrderFlow`, `orderId` on the sheet body | Route search or params: read them with `useSearch({ from })` / `useParams({ from })` |
| A read's own answer handed across the hook boundary: `page` and `isPlaceholderData` from a region to its table | Navigation callbacks (`onOpenOrder`, `onCreated`, `onClose`): the component that performs the action navigates, with `useNavigate({ from })` |
| Data fetched upfront for a form: `customers` on `OrderCreateForm` (forms.md) | A search setter (`onSearchChange`, `onApply`, an `updateSearch` built in the route): the component that changes search writes it |
| A primitive's behaviour that varies per call site: `onOpenChange` on a sheet, `onRowClick` on the shared `DataTable`, `onRetry` | Configuration that only says which surface the component is on (`columns`, `tableKey`, `customerId`): split per surface instead |
| One identity naming a surface when two surfaces share one contract and one component: `from` on `OrdersFilter` | Values derivable from a record already passed: pass the record, derive inside |

When the same component would need different props on two routes, write one component per surface, each reading its own route (`OrdersTable` and `CustomerOrdersTable`). That is the entity owning both surfaces, not duplication to avoid. A shared component in `shared/` that is generic over every route (`ActiveFilters`) reads the current route loosely (`useSearch({ strict: false })`, `navigate({ to: "." })`) and takes only its contract.

Route files therefore pass almost nothing down. `routes/_app/orders/route.tsx` renders `<OrdersFilter from="/_app/orders" />`, `<ActiveFilters fields defaults />` and `<OrdersTableRegion />`, and every leaf does its own reading and navigating.

## Names

- Use the domain's nouns and verbs. Don't abbreviate, except for wire terms the backend spells that way.
- Put the most significant word first and qualifiers last: `creditOverrun`, `thresholdsMax`.
- One name per concept, and one helper per concept.
- A wrapper that only calls another function with the same arguments is a second name for one thing. Inline it.
- Pass an options object wherever two arguments of the same type could be swapped.
