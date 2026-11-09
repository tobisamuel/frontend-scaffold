# Forms

React Hook Form owns editable values; zod owns validation; shadcn `Field` owns the markup. `features/orders/order-create-form.tsx` is the reference implementation.

## The shape

```tsx
const form = useForm({
  defaultValues: { amount: undefined, customerId: "", note: "" },
  resolver: zodResolver(createOrderSchema),
});

<Controller
  control={form.control}
  name="customerId"
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="order-customer">Customer</FieldLabel>
      <Select … aria-invalid={fieldState.invalid} />
      <FieldError errors={[fieldState.error]} />
    </Field>
  )}
/>
```

- **No generics on `useForm`.** The resolver infers both the input and the output type from the schema. Generics written by hand drift from the schema, and the one-generic form gets transformed fields wrong. The single exception is a discriminated-union schema, which RHF's inference collapses to one branch; leave a comment when you need it.
- **Validate on submit,** which is RHF's default, so don't write a `mode` key. RHF keeps `isValid` live in every mode, so `onChange` is never needed for that. After the first submit, `reValidateMode: "onChange"` re-checks each edit. Live validation while typing is a deliberate exception for a specific form, and it needs a comment.
- **`Controller` with `Field`, every time.** Use `Field data-invalid`, put `aria-invalid` on the control, and use `FieldError errors={[fieldState.error]}`. Connect the label with `htmlFor`/`id`, and give the focusable element `field.ref`.
- **An empty number input means `undefined`, never `""`.** Write `field.onChange(value === "" ? undefined : valueAsNumber)` and give the schema one message for every failure (`z.number({ error: "Enter an amount" })`). Never put `z.coerce.number()` behind a `z.string()` step; the string check fails first and produces messages like `Invalid input: expected ""`.
- **Don't validate twice.** `handleSubmit` always runs the resolver. Gate the submit button on what isn't validation: `mutation.isPending`, `isDirty` for edits, and a layer-B bound. A button disabled until `isValid` turns itself off without saying why.
- **Name submit handlers `handle*`.** Pass library functions through as-is (`onBlur={field.onBlur}`).

## Where a rule goes

| Layer | The rule needs | Where it lives | How it shows |
| --- | --- | --- | --- |
| **A — shape** | only the field's own value, or a simple cross-field check | the zod schema | `FieldError`, on submit |
| **B — bounds** | other data: the chosen customer's credit limit, a fetched balance | one pure function in `lib/` (`creditOverrun`) | called in render for a live message and a disabled submit, and called again in the submit handler as a guard |
| **C — server** | facts only the server knows: can this order still be cancelled? | the server | the mutation's error, shown inline |

Rejected designs: a schema factory closed over fetched values, a custom resolver, or a server-derived flag smuggled into form values so a refine can read it. zod can't take outside data at parse time, so all three end up as one rule with two implementations that disagree. Before reaching for layer B, ask whether the rule really needs outside data or only seems to because of an exemption that shouldn't exist.

## Data upfront, as props

A form that needs fetched data (option lists, records) receives it as a prop from its route, which renders the form only once the data exists (`routes/_app/orders/new.tsx`). There is no loading or error branch inside the form. RHF caches `defaultValues`, so data that arrives late forces a `reset` under the user. When a dataset depends on a form value, fetch every variant upfront and pass a record keyed by that value.

## Filters are forms too

A filter popover is an RHF form seeded with `values: search` (RHF deep-compares before resetting), so it always opens showing what is applied, and the URL stays the only source of truth. Apply writes the URL. Never keep a `useState` draft copy: a draft is how a removed chip comes back on the next Apply. Clear uses `clearedFilters(fields, defaults)`, never `onChange(defaults)` (see [tables.md](tables.md)).

## Reading form state

- Derive values with `useWatch({ control, name })` and form state with `useFormState({ control })`. Never write a hook that takes the form instance.
- Inside a handler, read state at call time (`form.getFieldState(name, form.formState)`), never from a value captured during render.
- When a handler writes to a field, call that field's `onChange`, not `setValue`, which skips validation by default.
