import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm, useWatch } from "react-hook-form";

import { customersQueryOptions } from "@/features/customers/queries";
import type { Customer } from "@/features/customers/schemas";
import { creditOverrun } from "@/features/orders/lib/credit";
import { ordersQueryOptions } from "@/features/orders/queries";
import { createOrder } from "@/features/orders/requests.mock";
import { createOrderSchema } from "@/features/orders/schemas";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "@/shared/components/ui/toast";
import { formatMoney } from "@/shared/lib/format";

/**
 * The create-order form. The patterns it exists to show (docs/forms.md):
 *
 * - **Data upfront, as props.** The route fetches the customer list and
 *   renders this only once it has it. No loading or error branch in here:
 *   RHF caches `defaultValues`, so data arriving late would force a reset
 *   under the user.
 * - **Types inferred from the resolver.** `useForm` takes no generics; input
 *   and output types come from `createOrderSchema` through `zodResolver`.
 * - **Validation on submit** (RHF's default mode), errors shown per field
 *   through `Field` + `FieldError`.
 * - **A bound computed in render.** The credit limit needs the chosen
 *   customer's record, so `creditOverrun` is a pure function: called in render
 *   for a live message and a disabled submit, and again in the handler.
 * - **The mutation inline**, owning its own navigation: the form knows where
 *   a created order goes, so no `onCreated` callback is threaded through the
 *   route. Screen effects ride on `mutate()`.
 */
export const OrderCreateForm = ({ customers }: { customers: Customer[] }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: "/orders/new" });

  const form = useForm({
    defaultValues: { amount: undefined, customerId: "", note: "" },
    resolver: zodResolver(createOrderSchema),
  });

  const [amount, customerId] = useWatch({
    control: form.control,
    name: ["amount", "customerId"],
  });

  const customer = customers.find((candidate) => candidate.id === customerId);
  const overrun = creditOverrun(amount, customer);

  const create = useMutation({
    mutationFn: createOrder,
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ordersQueryOptions().queryKey,
        }),
        // The new order changes the customer's order count.
        queryClient.invalidateQueries({
          queryKey: customersQueryOptions().queryKey,
        }),
      ]);
      toast.add({ title: `${order.number} created`, type: "success" });
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    // The submit-time half of the credit bound. The resolver has already run
    // the schema's shape rules, so only the bound needs a second look.
    const selected = customers.find(
      (candidate) => candidate.id === values.customerId
    );

    if (creditOverrun(values.amount, selected) !== null) {
      return;
    }

    // Navigation rides on this call, so a request that settles after the
    // user has left cannot pull them back to the new order.
    create.mutate(values, {
      onSuccess: (order) =>
        navigate({
          params: { orderId: order.id },
          search: (previous) => previous,
          to: "/orders/$orderId",
        }),
    });
  });

  return (
    <form className="flex flex-1 flex-col gap-6 px-4" onSubmit={handleSubmit}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="customerId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="order-customer">Customer</FieldLabel>
              <Select
                onValueChange={(value) => field.onChange(value ?? "")}
                value={field.value || null}
              >
                <SelectTrigger
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                  id="order-customer"
                  ref={field.ref}
                >
                  <SelectValue placeholder="Choose a customer">
                    {(value: string | null) =>
                      customers.find((candidate) => candidate.id === value)
                        ?.name
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {customers.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                      <span className="text-ink-caption-1">
                        {option.company}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || overrun !== null}>
              <FieldLabel htmlFor="order-amount">Amount (USD)</FieldLabel>
              <Input
                aria-invalid={fieldState.invalid || overrun !== null}
                id="order-amount"
                inputMode="decimal"
                min={0}
                name={field.name}
                onBlur={field.onBlur}
                // Empty means `undefined`, never `""`: the schema's one
                // message covers it, with no string step to coerce through.
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ""
                      ? undefined
                      : event.target.valueAsNumber
                  )
                }
                ref={field.ref}
                step="0.01"
                type="number"
                value={field.value ?? ""}
              />
              {customer && overrun === null ? (
                <FieldDescription>
                  Credit limit {formatMoney(customer.credit_limit, "USD")}
                </FieldDescription>
              ) : null}
              {overrun === null ? null : (
                <FieldError>
                  {formatMoney(overrun, "USD")} over {customer?.name}&apos;s
                  credit limit
                </FieldError>
              )}
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="note"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="order-note">Note</FieldLabel>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                id="order-note"
                placeholder="Optional"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      {create.isError ? (
        <p className="text-body-sm text-red-500" role="alert">
          {create.error.message}
        </p>
      ) : null}

      <div className="mt-auto flex justify-end pb-4">
        {/* Gate only on what is not validation: the request in flight and
            the bound. Shape errors appear on submit, next to their field. */}
        <Button disabled={create.isPending || overrun !== null} type="submit">
          {create.isPending ? <Spinner data-icon="inline-start" /> : null}
          Create order
        </Button>
      </div>
    </form>
  );
};
