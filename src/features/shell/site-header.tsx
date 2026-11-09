import { Link } from "@tanstack/react-router";
import { MoonIcon, SunIcon } from "lucide-react";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { useBreadcrumbs } from "@/shared/hooks/use-breadcrumbs";
import { useTheme } from "@/shared/theme/theme-provider";

/**
 * The header: sidebar toggle, the breadcrumb trail and the theme toggle.
 *
 * The trail is the router's match chain (`useBreadcrumbs`): each crumb's href
 * is its match's own pathname, and a route opts in with `staticData.crumb`.
 * The last crumb is text with `aria-current`; earlier ones are links with
 * exact matching, since `Link` marks any ancestor of the current URL active.
 */
export const SiteHeader = () => {
  const crumbs = useBreadcrumbs();
  const { setTheme, theme } = useTheme();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-2 h-4" orientation="vertical" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const Label = crumb.label;

            const text =
              // oxlint-disable-next-line anti-slop/no-runtime-typeof -- a crumb is a string or a label component by contract.
              typeof Label === "string" ? (
                Label
              ) : (
                <Label>{(label) => label}</Label>
              );

            const isLast = index === crumbs.length - 1;

            return (
              <Fragment key={crumb.id}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{text}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={
                        <Link activeOptions={{ exact: true }} to={crumb.href} />
                      }
                    >
                      {text}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <Button
        aria-label="Toggle theme"
        className="ms-auto"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        size="icon-sm"
        variant="ghost"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </Button>
    </header>
  );
};
