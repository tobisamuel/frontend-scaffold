import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { customerOptionsQueryOptions } from "@/features/customers/queries";
import { OrderCreateForm } from "@/features/orders/order-create-form";
import { prefetch } from "@/shared/api/query-client";
import { TableError } from "@/shared/components/data-table/table-error";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * `/orders/new`: create is a route, never `?create=true` on the list. It is a
 * record surface, so it gets a URL, Back works, and the list's search state
 * has no create flag to reset (docs/overlays.md).
 *
 * The route owns the form's prerequisites: it reads the customer list and
 * renders the form only once that list exists, passing it as a prop. The
 * sheet chrome renders immediately; only its body waits.
 */
const NewOrderSheet = () => {
  const navigate = Route.useNavigate();
  const customers = useQuery(customerOptionsQueryOptions());

  const close = () =>
    navigate({ search: (previous) => previous, to: "/orders" });

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          void close();
        }
      }}
      open
    >
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New order</SheetTitle>
          <SheetDescription>
            The order starts as pending and can be cancelled until it ships.
          </SheetDescription>
        </SheetHeader>
        {customers.isPending ? (
          <div aria-busy className="flex flex-col gap-4 px-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : null}
        {customers.isError ? (
          <TableError
            onRetry={customers.refetch}
            title="We could not load customers"
          />
        ) : null}
        {customers.data ? <OrderCreateForm customers={customers.data} /> : null}
      </SheetContent>
    </Sheet>
  );
};

export const Route = createFileRoute("/_app/orders/new")({
  loader: ({ context }) => {
    prefetch(context.queryClient, customerOptionsQueryOptions());
  },
  component: NewOrderSheet,
});
