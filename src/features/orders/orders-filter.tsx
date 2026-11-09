import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
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
import { Field, FieldLabel } from "@/shared/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  formatDateRange,
  fromDateRange,
  toDateRange,
} from "@/shared/lib/date-range";
import type { FilterPatch } from "@/shared/lib/filters";
import { clearedFilters, filterLabel } from "@/shared/lib/filters";

/**
 * The orders filter popover: section tabs on the left, one fixed-size panel
 * on the right, Clear and Apply in a footer.
 *
 * It reads and writes its route's search itself; the URL is the only source
 * of truth. The form is seeded with `values` (RHF deep-compares before
 * resetting), so it always opens showing what is applied, and unapplied
 * edits never reach the request. No `useState` draft copy, which is how a
 * removed chip comes back on the next Apply.
 *
 * `from` is its one prop, and it is an identity, not data: the orders filter
 * is drawn on two surfaces (`/orders` and a customer's Orders tab) that share
 * one search contract, and it names which one it is on.
 */
export const OrdersFilter = ({
  from,
}: {
  from: "/_app/orders" | "/_app/customers/$customerId/orders";
}) => {
  const [open, setOpen] = useState(false);
  const search = useSearch({ from });
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(ordersFilterSchema),
    values: { created: search.created, status: search.status },
  });

  // A filter change restarts at the first page; `to: "."` keeps whichever
  // surface this is drawn on.
  const apply = (patch: Partial<OrdersFilterValues>) => {
    void navigate({
      replace: true,
      search: (previous: FilterPatch) => ({
        ...previous,
        ...patch,
        offset: 0,
      }),
      to: ".",
    });
    setOpen(false);
  };

  const handleApply = form.handleSubmit(apply);

  // SAFETY: `clearedFilters` only emits keys from the filter schema's own shape.
  const handleClear = () =>
    apply(
      clearedFilters(
        ordersFilterSchema.shape,
        defaultOrdersSearch
      ) as Partial<OrdersFilterValues>
    );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger render={<Button variant="outline" />}>
        <ListFilterIcon data-icon="inline-start" />
        Filter
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto">
        <form className="flex flex-col gap-2.5" onSubmit={handleApply}>
          <Tabs defaultValue="status" orientation="vertical">
            <div className="w-28 shrink-0 border-e pe-2">
              <TabsList variant="line">
                <TabsTrigger value="status">
                  {filterLabel(ordersSearchFields.status)}
                </TabsTrigger>
                <TabsTrigger value="created">
                  {filterLabel(ordersSearchFields.created)}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Both panels share one size, so switching sections never
                resizes the popover under the pointer. */}
            <TabsContent className="h-76 w-64 overflow-y-auto" value="status">
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={(value) =>
                      field.onChange(orderStatusEnum.safeParse(value).data)
                    }
                    value={field.value ?? "any"}
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem id="orders-status-any" value="any" />
                      <FieldLabel htmlFor="orders-status-any">
                        Any status
                      </FieldLabel>
                    </Field>
                    {orderStatusEnum.options.map((status) => (
                      <Field key={status} orientation="horizontal">
                        <RadioGroupItem
                          id={`orders-status-${status}`}
                          value={status}
                        />
                        <FieldLabel htmlFor={`orders-status-${status}`}>
                          {orderStatusMeta[status].label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                )}
              />
            </TabsContent>

            <TabsContent className="h-76 w-64" value="created">
              <Controller
                control={form.control}
                name="created"
                render={({ field }) => (
                  <div className="flex h-full flex-col items-center">
                    {/* The calendar speaks `Date`s, the URL speaks ISO date
                        strings: both conversions happen here. */}
                    <Calendar
                      defaultMonth={toDateRange(field.value)?.from}
                      mode="range"
                      onSelect={(range) => field.onChange(fromDateRange(range))}
                      selected={toDateRange(field.value)}
                    />
                    <p className="mt-auto text-xs text-muted-foreground">
                      {formatDateRange(field.value) ?? "Any date"}
                    </p>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>

          <footer className="flex justify-between border-t pt-2.5">
            <Button onClick={handleClear} type="button" variant="ghost">
              Clear
            </Button>
            <Button type="submit">Apply</Button>
          </footer>
        </form>
      </PopoverContent>
    </Popover>
  );
};
