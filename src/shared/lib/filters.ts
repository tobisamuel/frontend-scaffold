import * as z from "zod";

/**
 * Filter metadata: the one place a filter's human face is declared.
 *
 * The failure this replaces is one `*-active-filters.tsx` file per list, each
 * walking its search object by hand and asking "is this filter set?" its own
 * way. Two of the three things those files wrote are already known: the
 * router computes "is it set?" with `stripSearchParams(defaults)`, and the
 * reset value is the field's own zod default. Only the sentence is
 * per-feature, and that is what this registry holds.
 *
 * A Zod registry because `.register()` is the one Zod method that returns the
 * original schema instead of a new instance, so the annotation sits inline on
 * the field and `schema.shape[key]` is the instance the registry was keyed on.
 * `z.$output` binds `format`'s argument to that field's own type, so a
 * formatter reading the wrong shape stops compiling.
 *
 * **`.register()` must come last in a field's chain.** `.default()`,
 * `.optional()` and `.array()` each return a new instance; registering before
 * them keys a schema that never reaches `.shape`, and the chip silently
 * disappears.
 */
export interface FilterMeta {
  /** The chip's key label and the filter section's heading. */
  label: string;
  /**
   * The chip's value text, or `null` when the filter is not set. Folding "is
   * it set?" and "what does it say?" into one function makes a set filter with
   * no chip unrepresentable.
   */
  format: (value: z.$output) => string | null;
}

export const filterMeta = z.registry<FilterMeta>();

/** A search schema's fields, as `schema.shape` hands them over. */
export type FilterFields = Record<string, z.ZodType>;

/**
 * A partial write to a route's search. Open on purpose: this layer is generic
 * over every route's search shape, and the key set is narrowed back to
 * `Partial<TSearch>` at the call site.
 */
// oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- generic over every route's search shape; narrowed at the call site.
export type FilterPatch = Record<string, unknown>;

export interface FilterChip {
  /** The schema key, which is also what removing the chip resets. */
  key: string;
  label: string;
  value: string;
}

/**
 * Every set filter on `search`, as chips. A field with registered metadata is
 * a filter; a field without one (pagination) is plumbing.
 */
export const activeFilterChips = (
  fields: FilterFields,
  // oxlint-disable-next-line anti-slop/no-object-parameters -- generic over every route's search shape.
  search: object
): FilterChip[] => {
  // SAFETY: `fields` is the shape of the schema `search` was parsed from, so every key walked below exists on it.
  const values = search as FilterPatch;

  return Object.entries(fields).flatMap(([key, field]) => {
    const meta = filterMeta.get(field);

    if (!meta) {
      return [];
    }

    const value = meta.format(values[key]);

    return value === null ? [] : [{ key, label: meta.label, value }];
  });
};

/**
 * A filter section's heading, read off the same registry entry the chip
 * reads. Throws rather than falling back: a nameless section is a missing
 * `.register()` call, and a silent empty heading hides it.
 */
export const filterLabel = (field: z.ZodType): string => {
  const meta = filterMeta.get(field);

  if (!meta) {
    throw new Error("Filter field has no metadata. Is `.register()` missing?");
  }

  return meta.label;
};

/**
 * A patch that clears every filter at once.
 *
 * Not `onChange(defaults)`, for two reasons. Zod omits absent optional keys
 * from its output, so `{ ...previous, ...defaults }` leaves an old optional
 * filter sitting there; every key must be present and `undefined` to survive
 * a spread. And defaults cover pagination too, which clearing filters should
 * not reset. Walking the registry restricts the patch to real filters.
 */
export const clearedFilters = (
  fields: FilterFields,
  // oxlint-disable-next-line anti-slop/no-object-parameters -- generic over every route's search shape.
  defaults: object
) => {
  // SAFETY: `fields` is the shape `defaults` was parsed from; absent optionals read as `undefined`, which is what a cleared filter carries.
  const values = defaults as FilterPatch;

  const cleared: FilterPatch = {};

  for (const [key, field] of Object.entries(fields)) {
    if (filterMeta.has(field)) {
      cleared[key] = values[key];
    }
  }

  return cleared;
};
