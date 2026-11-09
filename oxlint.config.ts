import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import tanstack from "ultracite/oxlint/tanstack";
import tanstackJsPlugins from "ultracite/oxlint/tanstack/js-plugins";

const jsPlugins = selectJsPlugins(["react-doctor"]);

export default defineConfig({
  env: core.env,
  // anti-slop must come after core: it turns off the two core rules it would
  // otherwise fight in a fix loop (`consistent-indexed-object-style`,
  // `no-immediate-mutation`).
  extends: [
    core,
    react,
    tanstack,
    tanstackJsPlugins,
    shadcn,
    antiSlop,
    jsPlugins,
  ],
  // oxlint does not apply ignorePatterns from extended configs, so core's list
  // is re-declared here. The rest are files copied from shadcn as shipped:
  // lint stays off so the next `shadcn add -o` is a clean diff, while oxfmt
  // still formats them so their class strings stay sorted.
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "**/components/ui/**",
    "src/shared/hooks/use-mobile.ts",
    "src/shared/hooks/use-highlighted-code.ts",
    "src/shared/lib/highlighter.tsx",
    "src/shared/lib/utils.ts",
    "src/shared/theme/theme-provider.tsx",
  ],
  // Re-declared on the root so dependency analysers (Knip) see the packages.
  jsPlugins: [...jsPlugins.jsPlugins, ...shadcn.jsPlugins],
  overrides: [
    {
      // The table kit is a component implementation: every class it renders
      // arrives as data (a column's `meta.className`, the sticky header's
      // surface), so call-site class rules cannot apply inside it. The
      // classes themselves are still checked where they are authored, in the
      // `*-columns.tsx` files.
      files: ["src/shared/components/data-table/**"],
      rules: {
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
      },
    },
    {
      // anti-slop on tooling configs is noise: the defensive spreads and
      // typeof guards it flags are the right call when merging a preset.
      files: ["*.config.ts"],
      rules: {
        "anti-slop/no-conditional-empty-object-spread": "off",
        "anti-slop/no-runtime-typeof": "off",
      },
    },
  ],
  rules: {
    // Component boundaries follow responsibility, not branch or line budgets.
    // See docs/architecture.md §3: splitting a coherent component to satisfy
    // a size rule is the exact mistake the architecture forbids.
    complexity: "off",
    "react-doctor/no-giant-component": "off",
    // Passing a library's own function straight through (`onRetry={refetch}`,
    // `onBlur={field.onBlur}`) is clearer than wrapping it to earn a
    // `handle*` name.
    "react/jsx-handler-names": "off",
  },
  // oxlint does not merge `settings` from extended configs, so the js-plugin
  // settings must sit on the root. Curated mode keeps react-doctor's
  // framework-aware route-file behaviour (allows `export const Route`).
  settings: jsPluginSettings,
});
