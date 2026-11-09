import { RotateCcwIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

/**
 * A failed read with nothing to keep, drawn inside the region that failed.
 *
 * Never in place of the page: the header, filters and pagination around it
 * are chrome of a screen the user is still on. When a page turn or filter
 * change fails, `keepPreviousData` keeps the previous rows and this is never
 * reached.
 */
export const TableError = ({
  description,
  onRetry,
  title = "We could not load this list",
}: {
  description?: string;
  onRetry: () => void;
  title?: string;
}) => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <RotateCcwIcon />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      {description ? <EmptyDescription>{description}</EmptyDescription> : null}
    </EmptyHeader>
    <EmptyContent>
      <Button onClick={onRetry} variant="outline">
        Try again
      </Button>
    </EmptyContent>
  </Empty>
);
