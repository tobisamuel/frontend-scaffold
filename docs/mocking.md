# Mock requests

The UI is built against fixtures behind a fake network, so every loading, empty, error and invalidation path is real code from day one. Swapping in a real endpoint changes one file per feature.

## The seam

```
features/orders/
├── queries.ts          queryOptions builders: import fetchers from requests.mock.ts
├── requests.mock.ts    fetchOrders, fetchOrder, createOrder, cancelOrder over fixtures
└── sample-data.ts      SAMPLE_ORDERS, built from a seed
shared/dev/
├── fake-api.ts         fakeRequest(name, run): latency, failure switch, deep copy
└── fixtures.ts         seeded generator, FIXTURE_NOW, id and date builders
```

Each function in `requests.mock.ts` is the request. Its arguments are what the live call would send and its return value is what the server would answer, so filtering, paging, not-found and refusals all happen there, not in components. Writes mutate the fixture array, so an invalidation refetches real changed data.

## Going live

1. Write `features/<domain>/requests.ts` with the same function signatures against `shared/api/client.ts`, parsing every response with the wire schema: `api.get("orders", { searchParams }).json(ordersPageSchema)`. Map a 404 on a detail read to `null`.
2. Change the imports in `queries.ts` and in the components and routes that call a write.
3. Delete `requests.mock.ts` and `sample-data.ts`. When the last feature is live, delete `shared/dev/`.

Nothing above the request layer changes: keys, loaders, regions and forms already behave as they will against the server.

## Fixtures are built, not transcribed

- **Deterministic.** A seeded generator, so ids survive reloads and machines and a detail URL stays a real URL. No `Math.random()` or `Date.now()` at module scope.
- **Anchored in time.** `FIXTURE_NOW` is a fixed instant, so date filters give the same results every run.
- **In the wire's shape.** ISO date strings, the backend's status keys, ids shaped like the backend's ids. Format at the cell.

## Dev switches

Set these from the browser console. They're read on every request, so no reload is needed.

```js
localStorage.mockLatency = "8"; // every request 8x slower: inspect skeletons
localStorage.mockFail = "GET orders"; // requests whose name contains this reject
localStorage.removeItem("mockFail");
```

The base latency follows a fixed cycle (420/680/340/900/520ms), so screenshots are reproducible.

## Lessons already paid for

- **A response is a copy.** `fakeRequest` returns `structuredClone(run())`. Without the copy, a write mutated objects Query already held, the refetch compared equal to the cache because it _was_ the cache, structural sharing kept the old reference, and a cancelled order stayed "Processing" on screen.
- **Query pauses retries in background tabs.** A headless browser reports `visibilityState: "hidden"`, so with `mockFail` set the region stays in its skeleton instead of reaching the error frame. Focus the tab, or call `focusManager.setFocused(true)`, to see it.
