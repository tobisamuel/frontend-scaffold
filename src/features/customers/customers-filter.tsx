import { zodResolver } from "@hookform/resolvers/zod";
import { ListFilterIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { customerStatusMeta } from "@/features/customers/constants";
import type { CustomersFilterValues } from "@/features/customers/schemas";
import {
  customerStatusEnum,
  customersFilterSchema,
  customersSearchFields,
  defaultCustomersSearch,
} from "@/features/customers/schemas";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  formatDateRange,
  fromDateRange,
  toDateRange,
} from "@/shared/lib/date-range";
import { clearedFilters, filterLabel } from "@/shared/lib/filters";

/**
 * The customers filter popover. Same shape as `OrdersFilter`, written out
 * rather than abstracted: two filters is repetition worth reading, not yet a
 * pattern worth a shared component (docs/conventions.md).
 */
export const CustomersFilter = ({
  onApply,
  search,
}: {
  onApply: (patch: Partial<CustomersFilterValues>) => void;
  search: CustomersFilterValues;
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(customersFilterSchema),
    values: { created: search.created, status: search.status },
  });

  const handleApply = form.handleSubmit((values) => {
    onApply(values);
    setOpen(false);
  });

  const handleClear = () => {
    // SAFETY: `clearedFilters` only emits keys from the filter schema's own shape.
    onApply(
      clearedFilters(
        customersFilterSchema.shape,
        defaultCustomersSearch
      ) as Partial<CustomersFilterValues>
    );
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger render={<Button variant="outline" />}>
        <ListFilterIcon data-icon="inline-start" />
        Filter
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto">
        <form className="flex flex-col gap-4" onSubmit={handleApply}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    {filterLabel(customersSearchFields.status)}
                  </FieldLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value ?? undefined)
                    }
                    value={field.value ?? null}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectItem value={null}>Any status</SelectItem>
                      {customerStatusEnum.options.map((status) => (
                        <SelectItem key={status} value={status}>
                          {customerStatusMeta[status].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="created"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    {filterLabel(customersSearchFields.created)}
                  </FieldLabel>
                  <Calendar
                    defaultMonth={toDateRange(field.value)?.from}
                    mode="range"
                    onSelect={(range) => field.onChange(fromDateRange(range))}
                    selected={toDateRange(field.value)}
                  />
                  <FieldDescription>
                    {formatDateRange(field.value) ?? "Any date"}
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button onClick={handleClear} type="button" variant="ghost">
              Clear
            </Button>
            <Button type="submit">Apply</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
