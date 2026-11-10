import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
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
import { clearedFilters, filterLabel } from "@/shared/lib/filters";

/**
 * The customers filter popover. Drawn by one route, so it takes no props: it
 * reads and writes `/customers` search itself. Same layout as `OrdersFilter`,
 * written out rather than abstracted (docs/architecture.md: abstract on the
 * third repetition, and then the whole flow, trigger included).
 */
export const CustomersFilter = () => {
  const [open, setOpen] = useState(false);
  const search = useSearch({ from: "/_app/customers/" });
  const navigate = useNavigate({ from: "/customers/" });

  const form = useForm({
    resolver: zodResolver(customersFilterSchema),
    values: { created: search.created, status: search.status },
  });

  const apply = (patch: Partial<CustomersFilterValues>) => {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, ...patch, offset: 0 }),
    });
    setOpen(false);
  };

  const handleApply = form.handleSubmit(apply);

  // SAFETY: `clearedFilters` only emits keys from the filter schema's own shape.
  const handleClear = () =>
    apply(
      clearedFilters(
        customersFilterSchema.shape,
        defaultCustomersSearch
      ) as Partial<CustomersFilterValues>
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
                  {filterLabel(customersSearchFields.status)}
                </TabsTrigger>
                <TabsTrigger value="created">
                  {filterLabel(customersSearchFields.created)}
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
                      field.onChange(customerStatusEnum.safeParse(value).data)
                    }
                    value={field.value ?? "any"}
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem id="customers-status-any" value="any" />
                      <FieldLabel htmlFor="customers-status-any">
                        Any status
                      </FieldLabel>
                    </Field>
                    {customerStatusEnum.options.map((status) => (
                      <Field key={status} orientation="horizontal">
                        <RadioGroupItem
                          id={`customers-status-${status}`}
                          value={status}
                        />
                        <FieldLabel htmlFor={`customers-status-${status}`}>
                          {customerStatusMeta[status].label}
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
                    <p className="mt-auto text-caption-lg text-ink-caption-1">
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
