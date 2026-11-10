import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { EllipsisIcon } from "lucide-react";

import {
  CANCELLABLE_ORDER_STATUSES,
  orderStatusMeta,
} from "@/features/orders/constants";
import type { Order } from "@/features/orders/schemas";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { formatMoney } from "@/shared/lib/format";
import { createAppColumnHelper } from "@/shared/lib/table/table";

/**
 * Orders columns. Widths are `size` on each def, alignment is `meta.align`,
 * and `DataTable` and `DataTableSkeleton` both read them, so the skeleton is
 * the loaded table's exact geometry.
 *
 * The entity owns its columns wherever it is drawn: the top-level list uses
 * `orderColumns`, a customer's Orders tab uses `customerOrderColumns`, which
 * drops the customer column (it is the page's subject) and the row menu (the
 * cancel confirmation route lives under `/orders`).
 */
const columnHelper = createAppColumnHelper<Order>();

const numberColumn = columnHelper.accessor("number", {
  header: "Order",
  size: 110,
});

const statusColumn = columnHelper.accessor("status", {
  cell: ({ getValue }) => (
    <Badge variant={orderStatusMeta[getValue()].variant}>
      {orderStatusMeta[getValue()].label}
    </Badge>
  ),
  header: "Status",
  size: 120,
});

const itemsColumn = columnHelper.accessor("items_count", {
  header: "Items",
  meta: { align: "end" },
  size: 80,
});

const totalColumn = columnHelper.accessor("total", {
  cell: ({ getValue, row }) => formatMoney(getValue(), row.original.currency),
  header: "Total",
  meta: { align: "end", className: "tabular-nums" },
  size: 120,
});

const createdColumn = columnHelper.accessor("created_at", {
  cell: ({ getValue }) => format(parseISO(getValue()), "MMM d, yyyy, h:mm a"),
  header: "Created",
  meta: { className: "text-ink-caption-1" },
  size: 190,
});

export const orderColumns = columnHelper.columns([
  numberColumn,
  columnHelper.accessor("customer_name", {
    // A link inside the row: `DataTable` ignores row clicks that land on an
    // anchor, so this opens the customer and the row opens the order.
    cell: ({ getValue, row }) => (
      <Link
        className="underline-offset-4 hover:underline"
        params={{ customerId: row.original.customer_id }}
        to="/customers/$customerId"
      >
        {getValue()}
      </Link>
    ),
    header: "Customer",
    size: 200,
  }),
  statusColumn,
  itemsColumn,
  totalColumn,
  createdColumn,
  columnHelper.display({
    /**
     * Row actions are links to routes, never dialogs mounted in the cell. A
     * dialog rendered here is a React child of the row, and React bubbles its
     * clicks to the row's `onClick` through the portal. Routing the
     * confirmation mounts it through the list's `<Outlet/>` instead, where
     * the row cannot reach it (docs/overlays.md).
     */
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions for ${row.original.number}`}
              className="ms-auto flex"
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={
              <Link
                from="/orders"
                params={{ orderId: row.original.id }}
                search={(previous) => previous}
                to="/orders/$orderId"
              />
            }
          >
            View details
          </DropdownMenuItem>
          {CANCELLABLE_ORDER_STATUSES.includes(row.original.status) ? (
            <DropdownMenuItem
              render={
                <Link
                  from="/orders"
                  params={{ orderId: row.original.id }}
                  search={(previous) => previous}
                  to="/orders/$orderId/cancel"
                />
              }
              variant="destructive"
            >
              Cancel order
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    header: () => <span className="sr-only">Actions</span>,
    id: "actions",
    meta: { align: "end", skeleton: "action" },
    size: 56,
  }),
]);

export const customerOrderColumns = columnHelper.columns([
  numberColumn,
  statusColumn,
  itemsColumn,
  totalColumn,
  createdColumn,
]);
