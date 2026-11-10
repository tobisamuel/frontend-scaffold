import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  orderQueryOptions,
  ordersQueryOptions,
} from "@/features/orders/queries";
import { cancelOrder } from "@/features/orders/requests.mock";
import type { Order } from "@/features/orders/schemas";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "@/shared/components/ui/toast";

/**
 * Cancel an order from inside a surface that is already open (the detail
 * sheet): the trigger and its dialog as one flow, with the dialog's open state
 * owned by base-ui through `AlertDialogTrigger`.
 *
 * Local, not a route, because the trigger is not in a table row: opening a
 * sibling route would close the sheet behind the dialog. Row-menu cancels go
 * through `/orders/$orderId/cancel` instead (docs/overlays.md).
 */
export const CancelOrderFlow = ({ order }: { order: Order }) => {
  const queryClient = useQueryClient();

  // Inline, where it is triggered: never a named hook in queries.ts.
  const cancel = useMutation({
    mutationFn: cancelOrder,
    onSuccess: async () => {
      // Await the refetch before the success feedback, so the sheet shows the
      // cancelled order when the toast appears, not a beat later.
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orderQueryOptions(order.id).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: ordersQueryOptions().queryKey,
        }),
      ]);
      toast.add({ title: `${order.number} cancelled`, type: "success" });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Cancel order
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel {order.number}?</AlertDialogTitle>
          <AlertDialogDescription>
            {order.customer_name} will be notified. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {cancel.isError ? (
          <p className="text-body-sm text-red-500" role="alert">
            {cancel.error.message}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Keep order</AlertDialogCancel>
          <Button
            disabled={cancel.isPending}
            onClick={() => cancel.mutate(order.id)}
            variant="destructive"
          >
            {cancel.isPending ? <Spinner data-icon="inline-start" /> : null}
            Cancel order
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
