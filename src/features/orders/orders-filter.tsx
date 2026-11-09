import { zodResolver } from "@hookform/resolvers/zod";
import { ListFilterIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { orderStatusMeta } from "@/features/orders/constants";
import type { OrdersFilterValues } from "@/features/orders/schemas";
import {
  defaultOrdersSearch,
  orderStatusEnum,
  ordersFilterSchema,
  ordersSearchFields,
} from "@/features/orders/schemas";
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
 * The orders filter popover.
 *
 * The URL is the only source of truth. The form is seeded with `values`
 * (RHF deep-compares before resetting), so it always opens showing what is
 * applied, and unapplied edits never leak into the request: Apply writes the
 * URL, the URL changes the query key. No `useState` draft copy, which is how
 * a removed chip comes back on the next Apply.
 *
 * Section headings come from the schema's filter registry, so "Status" is
 * written once and appears here and on the chip.
 */
export const OrdersFilter = ({
  onApply,
  search,
}: {
  onApply: (patch: Partial<OrdersFilterValues>) => void;
  search: OrdersFilterValues;
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(ordersFilterSchema),
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
        ordersFilterSchema.shape,
        defaultOrdersSearch
      ) as Partial<OrdersFilterValues>
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
                    {filterLabel(ordersSearchFields.status)}
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
                      {orderStatusEnum.options.map((status) => (
                        <SelectItem key={status} value={status}>
                          {orderStatusMeta[status].label}
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
                    {filterLabel(ordersSearchFields.created)}
                  </FieldLabel>
                  {/* The calendar speaks `Date`s, the URL speaks ISO date
                      strings: both conversions happen here, at the boundary. */}
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
