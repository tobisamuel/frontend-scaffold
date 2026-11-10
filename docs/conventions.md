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

Every colour, type step and radius comes from the token layer, `src/shared/theme/tokens.css`. Read its header before adding a colour.

- **Type is a named scale, never a size pair.** `text-heading-lg` (page titles), `text-heading-md` (figures, sheet titles), `text-body-md` (default body), `text-body-sm` (table headers, controls), `text-caption-lg` (badges, metadata). Each step carries its own line height and tracking, so never add `leading-*` or `tracking-*` beside one, and never write `text-sm`, `text-xs` or `text-[13px]`.
- **Colour is a role.** Text uses `text-ink-heading`, `text-ink-body-1/2` or `text-ink-caption-1/2`. Raised fills use `bg-surface-1/2/3`, where the number is the elevation. Edges use `border-stroke-1/2`, and dividers inside a surface use `border-hairline`. Icons use `text-icon-1/2/3`. Never use `text-muted-foreground` or a raw colour in app code.
- **Colour means status and nothing else.** Status badges use the tone variants `green`, `blue`, `yellow`, `red` and `neutral`. The variant is a colour, never a status, and each feature's status meta (`orderStatusMeta`) picks one. A call site knows where a status is shown, never which colour it is.
- **The primary action is ink:** black on light, white on dark. Use a single primary button per surface.
- **Pages** use `px-4 pt-4` and an 18px (`gap-4.5`) rhythm, with an `h1` at `text-heading-lg font-semibold text-ink-heading`. The shell caps content at 1508px, left-aligned.
- Write class names inline and in full, and never store them in constants.
- Don't restyle a primitive's colour, typography, spacing or shape from outside. `shadcn/no-restyle` enforces this and allows layout. Put layout on a plain wrapper. When the design needs a different look, change the primitive (a vendor edit, listed in [tooling.md](tooling.md)) or add a variant.
- Write a style in markup rather than reaching for `!important`.
- Use lucide icons directly (`<PlusIcon data-icon="inline-start" />`). Buttons and badges size and space them through `data-icon`; sidebar rows put each glyph in a 22px slot.

## TypeScript

- Infer wherever the library can: form types from the resolver, row types from columns, route types from the tree. Annotate at a boundary or to break an inference cycle (`CustomerBreadcrumb`).
- Pin a value set to its source with `as const satisfies Record<Status, …>`, so a new status from the contract fails at compile time.
- Every type assertion carries a `// SAFETY:` comment that states the invariant; anti-slop enforces this. Two in a row is a design problem.
- Use `const`. A `let` assigned in branches before a render becomes a function with early returns. `let` is fine for a counter or a seeded generator's state.
- Use arrow-function components and named exports. One component per file.

## Comments

Explain why, not what: the constraint, the bug that was paid for, the library behaviour that forced the shape. Point at the doc that owns the rule (`docs/overlays.md`) instead of restating it. A comment that only restates the code gets deleted.
