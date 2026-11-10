# Tooling

| Tool | What it does here |
| --- | --- |
| **Vite 8** + `@vitejs/plugin-react` | Dev server and build. |
| **React Compiler** | `react({ compiler: true })` through `oxc-transform-react`, the Rust port. No hand-written `useMemo`/`useCallback`; react-doctor flags them. |
| **TanStack Router plugin** | Generates `routeTree.gen.ts` and code-splits every route (`autoCodeSplitting`). Runs before the React plugin. |
| **TanStack devtools** | One shell with Router, Query and Table panels (`__root.tsx`). Ctrl+~ opens it. `devtools()` in `vite.config.ts` strips it from production builds, because the unified shell doesn't check `NODE_ENV` itself. |
| **Ultracite** (oxlint + oxfmt) | Lint and format. See below. |
| **TanStack Intent** | Library-maintained agent skills. `AGENTS.md` tells agents to run `intent list` and `intent load` before a substantial change. The allowlist is `intent.skills` in `package.json`. |
| **TypeScript 6** | `bun run typecheck` (`tsc -b`) covers the app and the tooling configs. |

## Scripts

```sh
bun run dev         # vite on :3000
bun run typecheck   # tsc -b
bun run lint        # oxlint
bun run format      # oxfmt
bun run check       # ultracite check (lint + format check)
bun run fix         # ultracite fix
bun run build       # tsc -b && vite build
```

The Claude Code and Codex hooks in `.claude/` and `.codex/` run `ultracite fix` after every agent edit.

## Ultracite: the setup routine

Repeat this whenever ultracite or react-doctor ships a release, so the config only keeps what the presets don't already give you.

1. **Re-init with the presets this repo uses:**
   ```sh
   bunx ultracite@latest init --pm bun --linter oxlint --editors universal \
     --agents universal claude --hooks claude codex --frameworks react tanstack \
     --js-plugins @shadcn/lint anti-slop oxlint-plugin-react-doctor -y
   ```
2. **Read the changelogs before restoring anything:** ultracite.ai/changelog and react-doctor's GitHub releases. Diff against the previous config (`git diff oxlint.config.ts oxfmt.config.ts`) and restore only what the new presets don't already cover. For example, ultracite 8's TanStack preset already turns off `no-use-before-define` and `sort-keys` for route files, and the shadcn preset now ships with ultracite.
3. **Restore what init doesn't know about this repo:**
   - **oxfmt:** merge, never replace, the Tailwind sort config and add `stylesheet: "./src/index.css"`. Replacing the object drops ultracite's class-function list. Without the stylesheet, oxfmt sorts against stock Tailwind and churns the order of custom variants.
   - **oxlint `ignorePatterns`:** re-declare `core.ignorePatterns` (oxlint doesn't inherit ignores) plus every file shadcn ships as-is: `**/components/ui/**`, `shared/hooks/use-mobile.ts`, `use-highlighted-code.ts`, `shared/lib/utils.ts`, `shared/lib/highlighter.tsx` and `shared/theme/theme-provider.tsx`. Lint is off so `shadcn add -o` stays a clean diff. Formatting stays on so their classes stay sorted.
   - **Extend `antiSlop` after `core`.** It turns off two core rules it would otherwise fight in a fix loop.
   - **Turn anti-slop's `no-runtime-typeof` and `no-conditional-empty-object-spread` off for `*.config.ts`.** Merging a preset needs exactly those guards.
   - **Put `settings: jsPluginSettings` on the root.** oxlint doesn't merge `settings` from extended configs.
   - **Re-declare `jsPlugins` on the root** so dependency analysers see the packages.
4. **Run `bun run check`, and report each rule that fights the codebase instead of silently disabling it.** The decision belongs to whoever owns the repo. Decisions already taken are below.
5. **Fix the editor config:** init may leave `editor.defaultFormatter` on Prettier in `.vscode/settings.json`, so set it to `oxc.oxc-vscode`. `.gitignore` whitelists that file.

## Lint decisions already taken

| Rule | Decision | Why |
| --- | --- | --- |
| `complexity`, `react-doctor/no-giant-component` | off | Component boundaries follow responsibility. Splitting a coherent component to satisfy a size budget is the mistake [architecture.md](architecture.md) forbids. Never refactor for these, and don't report them. |
| `react/jsx-handler-names` | off | Passing a library function straight through (`onRetry={refetch}`) is clearer than wrapping it to earn a `handle*` name. |
| `shadcn/no-restyle`, `shadcn/require-static-classes` | off in `shared/components/data-table/**` only | The table kit renders classes that arrive as data from column defs; they're checked where they're authored. |
| `anti-slop/require-safety-comment-for-type-assertion` | on | Every `as` states its invariant in a `// SAFETY:` comment. |
| `anti-slop/require-readable-spacing` | on | Autofixed by `ultracite fix`. |

## shadcn

`components.json` uses the `base-nova` style (Base UI primitives) with aliases under `@/shared/...`. The root `tsconfig.json` carries `paths` because the CLI reads the root file, not the referenced `tsconfig.app.json`. Without it, `shadcn add` writes to a literal `@/` folder. The primitives were installed with `shadcn add -a` and committed as shipped, so every later edit to them shows up as a diff. Edits made since, all onto the token layer:

| Primitive | Change |
| --- | --- |
| `sidebar.tsx` | Rows: 4px corners, `px-2 py-1.5`, `text-body-md` in `ink-body-2`, 22px icon slots in `icon-3`, `surface-2` hover and active, 38px squares in the icon rail. Group labels in `caption-lg`/`ink-caption-1`. |
| `table.tsx` | Rules on the cells (so a sticky header keeps its line), `h-[46.7px]` cell floor (a minimum in table layout, so tall cells still grow), headers in `body-sm`/`ink-caption-1`, `surface-1` row hover. |
| `badge.tsx` | 4px corners, `caption-lg`, and the tone variants `neutral`/`green`/`blue`/`yellow`/`red`. |
| `scroll-area.tsx` | Removed an unused `React` import that failed `tsc`. |

Widths that only the app knows (`--sidebar-width`, `--sidebar-width-icon`) are set on `SidebarProvider` in `routes/_app/route.tsx`, not edited into the primitive.
