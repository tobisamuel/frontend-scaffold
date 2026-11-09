# Where state lives

Each kind of state has exactly one owner. Most bugs in this area are one state with two owners.

| State | Owner | Example |
| --- | --- | --- |
| Server data | TanStack Query | orders, a customer |
| What the user is looking at | the URL (router search and params) | filters, page, the open sheet |
| Values being edited | React Hook Form | the create form, a filter popover's unapplied edits |
| UI state of one component | `useState` | a popover's `open` |
| Client-only state shared across distant parts of the tree | zustand | recently viewed customers |
| Request status | the mutation itself | `cancel.isPending`, `cancel.isError` |

## The bar for zustand

A store must clear all three of these:

1. **No server owns it.** Otherwise it belongs to Query.
2. **It isn't part of a URL.** Otherwise it belongs to the router, where it can be linked to and survives a reload.
3. **It is written in one subtree and read in a distant one.** Otherwise it is component state.

`features/customers/stores/recently-viewed.ts` clears all three: the profile route writes it, the sidebar reads it, and no server knows about it. It stores ids only. Names come from `customerQueryOptions`, so the sidebar never shows a stale copy of something the server has changed. Persist the data, never the actions (`partialize`). Write to a store from an event or a route lifecycle (`onEnter`), not from an effect that mirrors other state.

## Don't build a parallel state machine

A mutation already is a state machine: `idle | pending | error | success`. Branch on `mutation.status` and its data with early returns. Don't hand-roll a `resultState` union, a boolean chain or a `let` that mirrors it. Likewise, derive values in render instead of syncing them into state with an effect.
