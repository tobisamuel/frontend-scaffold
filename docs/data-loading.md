# Data loading

TanStack Query owns server state: requests, freshness, retries and outcomes. The router decides what to start fetching on navigation. Components observe query options. Nothing copies server data into router state, component state or a store.

## `queries.ts` holds query-options builders and nothing else

```ts
export const ordersQueryOptions = (request: OrdersRequest = {}) =>
  queryOptions({
    placeholderData: keepPreviousData,
    queryFn: () => fetchOrders(request),
    queryKey: ["orders", "list", withoutUndefined(request)] as const,
  });
```

- **Builders are the only place a key is built.** Invalidate with `ordersQueryOptions().queryKey` for every page or `orderQueryOptions(id).queryKey` for one record. Never hand-write key arrays, never use key factories (`orderKeys.list(...)`), never slice `queryKey[0]` with dummy arguments.
- **Unset parameters are omitted from the key.** Query's partial matching treats `undefined` as a value, so a key carrying `status: undefined` stops `ordersQueryOptions()` from matching any cached page, and people start reaching for `[0]` slices. `withoutUndefined` (`shared/lib/query-key.ts`) keeps the no-argument key a true prefix.
- **The request type is `Partial<Search>`,** so a builder called with no argument is valid, and the fetcher applies defaults the way a server would.
- **No mutation hooks.** Not in `queries.ts`, and not as named one-off hooks anywhere. A mutation is a `useMutation({...})` written where it is triggered, in the component or route that owns its outcome.

## Loading from a route

```ts
loaderDeps: ({ search }) => search,
loader: ({ context, deps }) => {
  prefetch(context.queryClient, ordersQueryOptions(deps));
},
```

`prefetch` (`shared/api/query-client.ts`) starts `queryClient.query()` without awaiting and swallows its rejection, because the warm cache is only an optimisation and the component that renders the data owns the failure. With `defaultPreload: "intent"`, hovering a nav link starts the request.

## Reading in a component

- **`useQuery`, not `useSuspenseQuery`, for regions.** A region branches on `isPending`, `isError` and data itself, inside its own chrome. `useSuspenseQuery` overrides `placeholderData` and throws errors up to the nearest boundary, which usually sits outside the chrome.
- **Several observers of one key are one request.** The profile layout, its Overview tab and the breadcrumb all observe `customerQueryOptions(id)`.
- **`keepPreviousData` keeps the previous page on screen** while the next one loads, dimmed through `isPlaceholderData`. So a list's skeleton only shows on first load. If the new key's request fails, the placeholder goes away.
- **`isError && !data`** is the error branch for a list: a failed refetch of a key that already has data keeps that data.
- **An unknown id is `null`, not an error.** `fetchOrder` answers `null` for a missing record, and the sheet renders "not found" inside itself. The live request maps a 404 to `null` in the same way.

## Writes

```ts
const cancel = useMutation({
  mutationFn: cancelOrder,
  onSuccess: async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ordersQueryOptions().queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: orderQueryOptions(id).queryKey,
      }),
    ]);
    toast.add({ title: "Order cancelled", type: "success" });
  },
});

cancel.mutate(id, { onSuccess: close });
```

- **Cache effects go on `useMutation`; screen effects go on `mutate()`.** Invalidation always has to happen. Navigation, closing and resetting only make sense if the user is still there: callbacks passed to `mutate()` don't fire after the component unmounts, so a request that settles after the user has left can't pull them back.
- **Await invalidation before success feedback** when the write changes what is on screen, so the toast and the updated row arrive together.
- **Declare every resource the write changes.** Creating an order changes the orders lists and the customer's order count.
- **Show the server's refusal, don't re-derive it.** `cancel.error.message` renders in the dialog. A failure gets reported once, either inline or as a toast, never both.
- **Use `mutate` with callbacks by default.** `mutateAsync` is for a continuation that needs the result, and its rejection must have an owner.

## Freshness and retries

The query client keeps Query's default `staleTime` (0) and focus refetching, with `retry: 1`. Put per-resource policy on that resource's options. The HTTP client sets `retry: 0` so that there is only one retry layer. Query pauses retries while the tab is hidden; a background tab that seems stuck pending is waiting for focus.
