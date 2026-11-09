import { Link } from "@tanstack/react-router";
import { CompassIcon } from "lucide-react";

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
 * The router's `defaultNotFoundComponent`. In the default `fuzzy` mode it
 * renders inside the nearest layout that matched, so an unknown URL keeps the
 * app chrome around it.
 */
export const RouteNotFoundPanel = () => (
  <Empty className="h-full">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <CompassIcon />
      </EmptyMedia>
      <EmptyTitle>Page not found</EmptyTitle>
      <EmptyDescription>
        The address may be mistyped, or the page may have moved.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button nativeButton={false} render={<Link to="/" />} variant="outline">
        Go home
      </Button>
    </EmptyContent>
  </Empty>
);
