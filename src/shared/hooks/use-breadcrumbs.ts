import { useRouterState } from "@tanstack/react-router";

import type { BreadcrumbEntry } from "@/shared/lib/breadcrumbs";

/**
 * The trail is the router's match chain: every match already carries its
 * interpolated `pathname` and `staticData`. The router owns ancestry and URLs;
 * query-backed label components own live names. A missing crumb is fixed with
 * a better route tree, never a per-page breadcrumb hook (docs/routing.md).
 */
export const useBreadcrumbs = (): BreadcrumbEntry[] =>
  useRouterState({
    select: (state) =>
      state.matches.flatMap((match) => {
        const label = match.staticData.crumb;

        return label ? [{ href: match.pathname, id: match.id, label }] : [];
      }),
  });
