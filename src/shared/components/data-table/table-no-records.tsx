import { SearchXIcon } from "lucide-react";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

/**
 * The default empty body for `DataTable`. A successful empty answer, never a
 * failure: errors render `TableError`.
 */
export const TableNoRecords = ({
  children = "No records found",
}: {
  children?: React.ReactNode;
}) => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <SearchXIcon />
      </EmptyMedia>
      <EmptyTitle>{children}</EmptyTitle>
    </EmptyHeader>
  </Empty>
);
