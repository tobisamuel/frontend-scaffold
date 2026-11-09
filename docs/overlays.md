# Overlays: sheets, dialogs and confirmations

## Route or local state

**An overlay is a route when it is a record surface or when its trigger sits in a table row. Everything else is local state, mounted next to its trigger.**

| Kind | Example | Owner |
| --- | --- | --- |
| Record view | order detail sheet | route: `/orders/$orderId` |
| Record create or edit | new order | route: `/orders/new`, never `?create=true` |
| Row-action confirmation | "Cancel order" from a row menu | route: `/orders/$orderId/cancel` |
| In-surface confirmation | "Cancel order" inside the open sheet | local: `CancelOrderFlow` |
| Action with input, multi-step flow, result | reject with a reason, a wizard | local |

Record surfaces get a URL because people link to them, press Back on them and reload them.

## Why row actions are routes

Base UI and Radix portal a dialog's DOM to `<body>`, but React bubbles synthetic events along the **React** tree. A dialog rendered from a table cell is a React child of `<TableRow onClick>`, so clicking "Keep order" inside it also fires the row's click and opens the record behind it. This happens with every composition style. As a route, the dialog mounts through the list's `<Outlet/>`, where no row can reach it, and the menu item becomes a plain `Link`. `DataTable` also ignores row clicks whose target isn't a DOM descendant of the row. Keep that guard.

## Why in-surface confirmations are local

If a button inside an open sheet navigated to a sibling route, the route would close the sheet behind its own dialog. So it opens a local `AlertDialog` over the sheet instead.

## Rules

- **The trigger and the dialog are one flow.** Write them together (`AlertDialogTrigger` + content + mutation), and extract them together when the flow repeats. Never extract the footer or button row and leave the dialog wired to it by state.
- **One open state per dialog,** owned by the nearest component that holds every opener. A dialog that only its own trigger opens lets the primitive own `open` through its `Trigger`. Never use a union state such as `pendingAction` across several dialogs.
- **Routed overlays render `open` and close by navigating:** `onOpenChange={(open) => { if (!open) void navigate({ to: "/orders", search: (previous) => previous }) }}`. Carry the list's search through so filters survive.
- **The shell opens immediately, and data loads inside it.** A routed confirmation reads its record with `useQuery` and keeps the command disabled until it is known.
- **Selects inside dialogs and sheets set `alignItemWithTrigger={false}`.** Base UI's default never resolves a side inside a dialog, and the menu lands on top of its trigger.
- **A button that renders a link sets `nativeButton={false}`.** Base UI otherwise warns, and the element loses link semantics.
