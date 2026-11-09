import type { ComponentType, ReactNode } from "react";

/**
 * A crumb label component receives a render function, so the header can
 * render text and the document title can receive a plain string.
 */
export interface BreadcrumbLabelProps {
  children: (label: string) => ReactNode;
}

/** A fixed label, or a component that reads the resource naming the route. */
export type Crumb = string | ComponentType<BreadcrumbLabelProps>;

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /** Opt this route into the breadcrumb trail. No crumb, not in the trail. */
    crumb?: Crumb;
  }
}

export interface BreadcrumbEntry {
  href: string;
  id: string;
  label: Crumb;
}
