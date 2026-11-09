import { createFileRoute } from "@tanstack/react-router";

import { orderQueryOptions } from "@/features/orders/queries";
import { prefetch } from "@/shared/api/query-client";

/**
 * `/orders/$orderId/*`: no component, so the router renders a bare
 * `<Outlet/>`. It exists to share one prefetch between its two children, the
 * detail sheet (`index.tsx`) and the cancel confirmation (`cancel.tsx`), which
 * are siblings: opening the confirmation from a row menu should not also open
 * the sheet.
 */
export const Route = createFileRoute("/_app/orders/$orderId")({
  loader: ({ context, params }) => {
    prefetch(context.queryClient, orderQueryOptions(params.orderId));
  },
});
