import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  orderQueryOptions,
  ordersQueryOptions,
} from "@/features/orders/queries";
import { cancelOrder } from "@/features/orders/requests.mock";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "@/shared/components/ui/toast";

/**
 * `/orders/$orderId/cancel`: the row menu's cancel confirmation.
 *
 * A route because its trigger is in a table row. A dialog mounted inside the
 * cell is a React child of the row, and React bubbles its clicks through the
 * portal to the row's `onClick`: "Keep order" would open the order. Routed,
 * the dialog mounts through the list's `<Outlet/>`, where no row can reach
 * it, and the menu item is a plain `Link` (docs/overlays.md).
 *
 * The in-sheet cancel is the opposite case (`CancelOrderFlow`): its trigger
 * is inside an open surface, so it stays local.
 */
const CancelOrderDialog = () => {
  const { orderId } = Route.useParams();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const {
    data: order,
    isError,
    isPending,
  } = useQuery(orderQueryOptions(orderId));

  const close = () =>
    navigate({ replace: true, search: (previous) => previous, to: "/orders" });

  const cancel = useMutation({
    mutationFn: cancelOrder,
    onSuccess: async (cancelled) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ordersQueryOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: orderQueryOptions(orderId).queryKey,
        }),
      ]);
      toast.add({ title: `${cancelled.number} cancelled`, type: "success" });
    },
  });

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) {
          void close();
        }
      }}
      open
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPending ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              `Cancel ${order?.number ?? "order"}?`
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isError
              ? "We could not load this order."
              : "The customer will be notified. This cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {cancel.isError ? (
          <p className="text-sm text-destructive" role="alert">
            {cancel.error.message}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Keep order</AlertDialogCancel>
          <Button
            // Unknown prerequisites keep the command disabled; the dialog
            // shell itself never waits.
            disabled={!order || cancel.isPending}
            // Navigation is a screen effect, so it rides on this call, not on
            // the mutation's own callbacks: if the user has already left,
            // nothing navigates them back.
            onClick={() => cancel.mutate(orderId, { onSuccess: close })}
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

export const Route = createFileRoute("/_app/orders/$orderId/cancel")({
  component: CancelOrderDialog,
});
