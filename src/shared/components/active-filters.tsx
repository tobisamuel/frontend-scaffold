import { useNavigate, useSearch } from "@tanstack/react-router";
import { XIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { FilterFields, FilterPatch } from "@/shared/lib/filters";
import { activeFilterChips, clearedFilters } from "@/shared/lib/filters";

/**
 * The applied-filter row for whichever list route it is drawn in. Nothing here
 * is per-feature: chip labels and sentences come off the schema's filter
 * registry (`shared/lib/filters.ts`), and the search it reads and writes is
 * the current route's, so a list passes only its contract and writes no chip
 * JSX and no search callback.
 */
export const ActiveFilters = ({
  defaults,
  fields,
}: {
  /** `schema.parse({})`: the same object the route hands `stripSearchParams`. */
  // oxlint-disable-next-line anti-slop/no-object-parameters -- generic over every list's search contract.
  defaults: object;
  /** The search schema's `.shape`, walked for registered filters. */
  fields: FilterFields;
}) => {
  // Not strict: this is drawn under every list route, and the registry walk
  // only needs an object to read keys from.
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const chips = activeFilterChips(fields, search);

  if (chips.length === 0) {
    return null;
  }

  // A filter change restarts at the first page. `to: "."` stays on the
  // current route, whichever list that is.
  const update = (patch: FilterPatch) =>
    navigate({
      replace: true,
      search: (previous: FilterPatch) => ({ ...previous, ...patch, offset: 0 }),
      to: ".",
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          render={
            <button
              aria-label={`Remove ${chip.label} filter: ${chip.value}`}
              // SAFETY: `defaults` was parsed from the schema whose shape `fields` is, so every chip key exists on it.
              onClick={() =>
                update({ [chip.key]: (defaults as FilterPatch)[chip.key] })
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
        onClick={() => update(clearedFilters(fields, defaults))}
        size="xs"
        variant="ghost"
      >
        Clear filters
      </Button>
    </div>
  );
};
