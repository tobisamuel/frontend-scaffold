<!-- intent-skills:start -->

## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement. Before editing files for a substantial task:

- Run `bunx --no-install --package @tanstack/intent intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `bunx --no-install --package @tanstack/intent intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

# Project rules

This repo is a pattern reference as much as an app. Before changing an area, read its doc; where the generic Ultracite section below disagrees with `docs/`, `docs/` wins.

| Task | Read first |
| --- | --- |
| New feature, new file, moving code | `docs/architecture.md` |
| Routes, loaders, search params, breadcrumbs | `docs/routing.md` |
| Queries, keys, invalidation, mutations | `docs/data-loading.md` |
| Skeletons, error and empty states | `docs/loading-and-errors.md` |
| Any form or filter | `docs/forms.md` |
| Sheets, dialogs, confirmations | `docs/overlays.md` |
| Tables, columns, filters and chips | `docs/tables.md` |
| Deciding where state lives (incl. zustand) | `docs/state.md` |
| Fixtures, mock requests, wiring a real endpoint | `docs/mocking.md` |
| Dates, styling, types, comments | `docs/conventions.md` |
| Lint, format, compiler, devtools, upgrading Ultracite | `docs/tooling.md` |

The rules agents most often break, each explained in its doc:

- `queries.ts` holds query-options builders only. Cache keys come only from those builders: no hand-written key arrays, no key factories, no `queryKey[0]`. Mutations are inline `useMutation` where they are triggered, never named hooks.
- Loaders `prefetch` and never await. Regions read with `useQuery` and render their own pending/error/empty states inside their chrome. Never `data ?? []`.
- A sheet is a child route of the list it floats over; the list renders `<Outlet/>`. Create is `/new`, never `?create=true`. Row-menu confirmations are routes; confirmations inside an open sheet are local.
- `useForm` takes no generics; validation runs on submit; forms receive fetched data as props.
- A component earns a file or is written inline: no private helper components, no single-use wrappers, no class-name constants. Abstract on the third repetition, and extract a dialog together with its trigger.
- Dates: inline `format(parseISO(value), ...)`; never `new Date(string)`, never a formatting wrapper.
- Never refactor to satisfy `complexity` or `no-giant-component`; both are off.

Verify with `bun run typecheck`, `bun run check` and the running app. Use the `mockLatency` and `mockFail` switches (`docs/mocking.md`) to see every state of what you changed.

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bunx ultracite fix`
- **Check for issues**: `bunx ultracite check`
- **Diagnose setup**: `bunx ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns
- Avoid import cycles; move shared code into a module both sides import

### Security

- Add `rel="noopener noreferrer"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt will catch most mechanical issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `bunx ultracite fix` before committing to ensure compliance.
