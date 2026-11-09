# Conventions

Small rules that drift when nobody writes them down. Each one was the majority pattern in one codebase and an outlier in another.

## Dates

- Use `date-fns` directly at the cell: `format(parseISO(value), "MMM d, yyyy, h:mm a")`. Never wrap it. Handling null is not a reason for a helper: `value ? format(parseISO(value), "…") : "—"` is shorter to read than following a wrapper through five parse attempts.
- **`parseISO`, never `new Date(string)`.** The constructor reads a bare `yyyy-MM-dd` as UTC midnight, which shows as the previous day west of Greenwich. Never `slice(0, 10)` a timestamp; use `format(parseISO(value), "yyyy-MM-dd")`.
- A helper earns a place only with real logic: `formatDateRange` composes a sentence, and `toDateRange`/`fromDateRange` convert at the calendar boundary.
- Use two display patterns: `MMM d, yyyy` for dates and `MMM d, yyyy, h:mm a` for date-times.
- Search params and fixtures store ISO strings. Ranges are one `{ from, to }` field.

## Numbers

`formatMoney(amount, currency)` and `formatCount(count, noun)` in `shared/lib/format.ts`. `formatMoney` caches a formatter per currency, so it is real logic rather than a wrapper. Add `tabular-nums` to numeric columns.

## Styling

- Write class names inline and in full, and never store them in constants. Repetition is fine; Tailwind is built for it.
- Don't restyle a primitive's colour, typography or effects from outside. `shadcn/no-restyle` enforces this, and layout (margin, width, flex, position) is allowed. When the design needs a different look, add a variant to the primitive and record why.
- Write a style in markup rather than reaching for `!important`. Every `!` written in the reference repos was later deleted.
- Use lucide icons directly (`<PlusIcon data-icon="inline-start" />`). shadcn's button and badge size and space them through `data-icon`.
- Edits to `shared/components/ui/*` are vendor edits. They're lint-exempt so `shadcn add -o` stays diffable, so record what changed and why in the commit message.

## TypeScript

- Infer wherever the library can: form types from the resolver, row types from columns, route types from the tree. Annotate at a boundary or to break an inference cycle (`CustomerBreadcrumb`).
- Pin a value set to its source with `as const satisfies Record<Status, …>`, so a new status from the contract fails at compile time.
- Every type assertion carries a `// SAFETY:` comment that states the invariant; anti-slop enforces this. Two in a row is a design problem.
- Use `const`. A `let` assigned in branches before a render becomes a function with early returns. `let` is fine for a counter or a seeded generator's state.
- Use arrow-function components and named exports. One component per file.

## Comments

Explain why, not what: the constraint, the bug that was paid for, the library behaviour that forced the shape. Point at the doc that owns the rule (`docs/overlays.md`) instead of restating it. A comment that only restates the code gets deleted.
