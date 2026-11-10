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
import { useBreadcrumbs } from "@/shared/hooks/use-breadcrumbs";
import { useTheme } from "@/shared/theme/theme-provider";

/**
 * The header: the breadcrumb trail and the theme toggle, on the page surface
 * with no border. The sidebar toggle lives in the sidebar's own top row.
 *
 * The trail is the router's match chain (`useBreadcrumbs`). It is hidden
 * below two entries: "Home" alone tells nobody anything. The last crumb is
 * text with `aria-current`; earlier ones are links with exact matching, since
 * `Link` marks any ancestor of the current URL active.
 */
export const SiteHeader = () => {
  const crumbs = useBreadcrumbs();
  const { setTheme, theme } = useTheme();

  return (
    <header className="flex h-12 w-full max-w-377 shrink-0 items-center justify-between gap-5 px-4">
      {crumbs.length > 1 ? (
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

              return (
                <Fragment key={crumb.id}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {index === crumbs.length - 1 ? (
                      <BreadcrumbPage>{text}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={
                          <Link
                            activeOptions={{ exact: true }}
                            to={crumb.href}
                          />
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
      ) : (
        <span />
      )}
      <Button
        aria-label="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        size="icon"
        variant="ghost"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </Button>
    </header>
  );
};
