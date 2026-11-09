import { createFileRoute } from "@tanstack/react-router";

import { OrderDetailsRegion } from "@/features/orders/order-details-region";
import { orderQueryOptions } from "@/features/orders/queries";
import { prefetch } from "@/shared/api/query-client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

/**
 * The same order sheet as `/orders/$orderId`, opened from a customer's
 * Orders tab: same body (`OrderDetailsRegion`), its own close target.
 */
const CustomerOrderSheet = () => {
  const { customerId, orderId } = Route.useParams();
  const navigate = Route.useNavigate();

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            params: { customerId },
            search: (previous) => previous,
            to: "/customers/$customerId/orders",
          });
        }
      }}
      open
    >
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Order details</SheetTitle>
        </SheetHeader>
        <OrderDetailsRegion orderId={orderId} />
      </SheetContent>
    </Sheet>
  );
};

export const Route = createFileRoute(
  "/_app/customers/$customerId/orders/$orderId"
)({
  loader: ({ context, params }) => {
    prefetch(context.queryClient, orderQueryOptions(params.orderId));
  },
  component: CustomerOrderSheet,
});
