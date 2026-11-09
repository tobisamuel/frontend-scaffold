import type { ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { TriangleAlertIcon } from "lucide-react";

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
 * A route's `errorComponent`. It renders in place of the route that threw,
 * which sits inside its parent's chrome, so the sidebar and header stay and
 * the user can navigate away. Put it on the route closest to the failure, so
 * the boundary replaces as little as possible (docs/loading-and-errors.md).
 *
 * Retry invalidates the router, which reruns loaders and remounts the route.
 */
export const RouteErrorPanel = ({ error, reset }: ErrorComponentProps) => {
  const router = useRouter();

  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          {error instanceof Error
            ? error.message
            : "An unexpected error stopped this page from loading."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={async () => {
            reset();
            await router.invalidate();
          }}
          variant="outline"
        >
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
};
