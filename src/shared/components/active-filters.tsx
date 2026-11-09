import { XIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { FilterFields, FilterPatch } from "@/shared/lib/filters";
import { activeFilterChips, clearedFilters } from "@/shared/lib/filters";

/**
 * The applied-filter row. Nothing here is per-feature: label and sentence both
 * come off the schema's filter registry (`shared/lib/filters.ts`), so a list
 * declares them once on its search schema and writes no chip JSX.
 */
export const ActiveFilters = <TSearch extends object>({
  defaults,
  fields,
  onChange,
  search,
}: {
  /** `schema.parse({})`: the same object the route hands `stripSearchParams`. */
  defaults: TSearch;
  fields: FilterFields;
  /** The route's search sink, the same one Apply uses. */
  onChange: (patch: Partial<TSearch>) => void;
  search: TSearch;
}) => {
  const chips = activeFilterChips(fields, search);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          render={
            <button
              aria-label={`Remove ${chip.label} filter: ${chip.value}`}
              // SAFETY: the key came from `fields`, the shape `defaults` was parsed from, so the patch is a subset of TSearch.
              onClick={() =>
                onChange({
                  [chip.key]: (defaults as FilterPatch)[chip.key],
                } as Partial<TSearch>)
              }
              type="button"
            />
          }
          variant="secondary"
        >
          <span className="text-muted-foreground">{chip.label}</span>
          {chip.value}
          <XIcon data-icon="inline-end" />
        </Badge>
      ))}

      <Button
        // SAFETY: `clearedFilters` only emits keys found in `fields`, so the patch is a subset of TSearch.
        onClick={() =>
          onChange(clearedFilters(fields, defaults) as Partial<TSearch>)
        }
        size="xs"
        variant="ghost"
      >
        Clear filters
      </Button>
    </div>
  );
};
