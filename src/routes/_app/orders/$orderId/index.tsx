import { createFileRoute } from "@tanstack/react-router";

import { OrderDetailsRegion } from "@/features/orders/order-details-region";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

/**
 * `/orders/$orderId`: the detail sheet, rendered through the list's
 * `<Outlet/>`, so the table stays mounted behind it and the URL is the only
 * thing that says the sheet is open.
 *
 * The sheet opens on the click: nothing here awaits, and its chunk was
 * preloaded when the list resolved (`src/router.tsx`). Loading, failure and
 * an unknown id all render inside the sheet (`OrderDetailsRegion`).
 */
const OrderSheet = () => {
  const { orderId } = Route.useParams();
  const navigate = Route.useNavigate();

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          void navigate({ search: (previous) => previous, to: "/orders" });
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

export const Route = createFileRoute("/_app/orders/$orderId/")({
  component: OrderSheet,
});
