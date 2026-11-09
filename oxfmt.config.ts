import { defineConfig } from "oxfmt";
import type { SortTailwindcssUserConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

// Merge, never replace: ultracite's object carries the class-function list
// (clsx, cva, tw, twMerge, cn, twJoin, tv). Replacing it silently drops every
// function but the ones written here.
//
// `stylesheet` points the sorter at this project's Tailwind v4 entry, so the
// custom `dark` variant and `@theme` tokens sort where Tailwind puts them.
// Without it oxfmt sorts against stock theme.css and churns class order.
const sortTailwindcss: SortTailwindcssUserConfig = {
  ...(typeof ultracite.sortTailwindcss === "object"
    ? ultracite.sortTailwindcss
    : {}),
  stylesheet: "./src/index.css",
};

export default defineConfig({
  ...ultracite,
  // The shadcn primitives are not ignored here on purpose: lint is off for
  // them, but formatting keeps their class strings sorted.
  sortTailwindcss,
});
