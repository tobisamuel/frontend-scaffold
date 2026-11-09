# Loading and errors

A loading or error state replaces the UI it surrounds, so it goes around the content that is waiting and nothing more. The navigation, headings, filters and close buttons around it don't depend on the request, so they stay.

| Surface | Pending | Error | Empty or missing |
| --- | --- | --- | --- |
| List table | `DataTableSkeleton` built from the same columns, `search.limit` rows. Header, filters and chips stay. | `DataTableErrorFrame`: the same header row and widths, with a retry in the body. No count is shown. | `TableNoRecords` in the body. Never an error message. |
| Page or filter change | `keepPreviousData` keeps the previous page, dimmed. | The previous page stays if the same key fails to refetch; a new key that fails shows the error frame. | As above. |
| Detail sheet | The sheet opens on the click, with a skeleton inside it. The list stays mounted behind. | A retry inside the sheet. | "Not found" inside the sheet when the fetcher answers `null`. |
| Confirmation dialog | The dialog shell opens at once; the title waits. The command stays disabled until its record is known. | The dialog says it could not load the record; a refused command shows the server's message inline. | — |
| Form with prerequisites | The route shows a skeleton inside the sheet and renders the form only once its data exists ([forms.md](forms.md)). | A retry inside the sheet. | — |
| Profile layout | The header skeletons; tabs render and own their reads. | A retry in place of the layout body, inside the app shell. | "Customer not found". |
| Independent cards | Each card has its own skeleton. | Each card fails on its own. | Empty stays empty, never a made-up zero. |

## Rules

- **A failed request is not a successful empty response.** Never write `data?.items ?? []`. It turns a failure into "no records". The only deliberate empty array is inside `DataTableErrorFrame`.
- **Claims are real or absent.** Counts, balances and permission-dependent actions come from known values. While a record is unknown, the command that needs it stays disabled.
- **Route `errorComponent`s are for render failures,** not data failures, and they render inside the parent's chrome (`RouteErrorPanel`). Data failures belong to the region that read the data.
- **Skeletons match geometry.** A table skeleton reads the column defs. A sheet skeleton mirrors the body's layout. A skeleton gets its own `-skeleton.tsx` file when it is a complete view, and stays inline when it is a fragment.

Exercise every state with the mock switches in [mocking.md](mocking.md): `mockLatency` holds skeletons on screen, and `mockFail` triggers error frames.
