import { format, parseISO } from "date-fns";

import { customerStatusMeta } from "@/features/customers/constants";
import type { Customer } from "@/features/customers/schemas";
import { Badge } from "@/shared/components/ui/badge";
import { formatMoney } from "@/shared/lib/format";
import { createAppColumnHelper } from "@/shared/lib/table/table";

const columnHelper = createAppColumnHelper<Customer>();

export const customerColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    cell: ({ getValue, row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{getValue()}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.email}
        </span>
      </div>
    ),
    header: "Customer",
    size: 260,
  }),
  columnHelper.accessor("company", { header: "Company", size: 160 }),
  columnHelper.accessor("status", {
    cell: ({ getValue }) => (
      <Badge variant={customerStatusMeta[getValue()].variant}>
        {customerStatusMeta[getValue()].label}
      </Badge>
    ),
    header: "Status",
    size: 120,
  }),
  columnHelper.accessor("orders_count", {
    header: "Orders",
    meta: { align: "end", className: "tabular-nums" },
    size: 90,
  }),
  columnHelper.accessor("credit_limit", {
    cell: ({ getValue }) => formatMoney(getValue(), "USD"),
    header: "Credit limit",
    meta: { align: "end", className: "tabular-nums" },
    size: 120,
  }),
  columnHelper.accessor("created_at", {
    cell: ({ getValue }) => format(parseISO(getValue()), "MMM d, yyyy"),
    header: "Joined",
    meta: { className: "text-muted-foreground" },
    size: 130,
  }),
]);
