# RFC: AsyncSearchableSelect — API-backed Combobox with URL-Synced Search and Lazy-Scroll Pagination

> **Status:** Implemented
> **Author:** elsie
> **Created:** 2026-07-16

---

## Summary

Add `AsyncSearchableSelect` — a sibling to `SearchableSelect` (RFC 0003) that fetches its options from
an API as the user types, instead of filtering a static array. It debounces search input, paginates
results with lazy/infinite scroll inside the popover, and optionally syncs the current search text to
the URL using the existing `TableRouterAdapter` pattern.

## Motivation

`SearchableSelect`'s RFC (0003) explicitly scoped "Async/remote search" as a Non-Goal: it requires a
full `Option[]` array up front, which doesn't work for option sets that are large, paginated, or owned
by a remote API (e.g. searching thousands of users or camera servers by name). Consumers need a
combobox that:

- Searches server-side rather than filtering a pre-fetched array.
- Loads more results as the user scrolls, rather than requiring every option up front.
- Reflects the current search text in the URL, consistent with how table-craft already syncs filter
  state to the URL (see `DataTableRoleFilter`, `FilterSerializer`).

## Goals

- Server-side search via a consumer-supplied `fetchOptions` callback (page-number based pagination).
- Lazy-scroll pagination inside the popover's option list via `IntersectionObserver`.
- Optional URL sync of the search text via the existing `TableRouterAdapter` + `paramKey` pattern,
  no-op when no router is configured.
- Dependency-free — no new runtime dependency (no react-query/SWR), consistent with the rest of the
  library.
- Consistent design and prop-naming with `SearchableSelect`.

## Non-Goals

- Caching fetched pages across component remounts or across popover close/reopen — every reopen
  refetches page 1 fresh. This library has no cache/query layer anywhere else; adding one here would
  be new architecture out of scope for this component.
- Multi-select (use `DataTableFacetedFilter`).
- Cursor-based pagination — page-number based only, per the confirmed API design.
- Resolving the label for a selected-but-not-yet-loaded value. The component has no way to fetch "the
  option for this id" without an API shape assumption, so it accepts an optional `selectedLabel` prop
  and falls back to the raw `value` if that's also absent (only when `value` is non-empty — see
  Amendments).

## API Design

```tsx
export interface AsyncOptionsFetchParams {
  search: string
  page: number
  pageSize: number
}
export interface AsyncOptionsFetchResult {
  options: Option[]
  hasMore: boolean
}
export type AsyncOptionsFetcher = (params: AsyncOptionsFetchParams) => Promise<AsyncOptionsFetchResult>

export interface AsyncSearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  fetchOptions: AsyncOptionsFetcher
  selectedLabel?: string
  placeholder?: string
  searchPlaceholder?: string
  allLabel?: string
  emptyText?: string
  loadingText?: string
  loadingMoreText?: string
  errorText?: string
  className?: string
  disabled?: boolean
  paramKey?: string
  debounceMs?: number
  pageSize?: number
  renderSelected?: (option: Option | undefined, value: string) => React.ReactNode
}
```

### Usage

```tsx
<AsyncSearchableSelect
  value={currentArea}
  onValueChange={(v) => handleMultiSearchChange('areaId', v ? [v] : [])}
  fetchOptions={async ({ search, page, pageSize }) => {
    const res = await fetch(`/api/areas?q=${search}&page=${page}&pageSize=${pageSize}`)
    const data = await res.json()
    return { options: data.items, hasMore: data.hasMore }
  }}
  selectedLabel={currentAreaLabel}
  paramKey="areaQuery"
  placeholder={t('filterArea')}
  className="w-40"
/>
```

## Architecture Integration

### New component — `src/components/async-searchable-select.tsx`

Uses the same `Popover` + `Command` + `CommandInput` shell as `SearchableSelect`, with `shouldFilter={false}`
on `Command` since options arrive pre-filtered from the server. `CommandInput` is driven as a controlled
input (`value`/`onValueChange`) rather than relying on cmdk's built-in filtering.

A request-generation counter (`genRef`) guards against out-of-order debounced responses: it's bumped on
every new search and on popover close, and both the initial-page and load-more fetch handlers discard
their response if the generation has since changed.

Lazy scroll is implemented with an `IntersectionObserver` whose `root` is `CommandList`'s forwarded ref
(cmdk forwards this straight to the scrollable `[cmdk-list]` div), observing a sentinel element rendered
as the last item while `hasMore` is true.

### URL sync

Mirrors `DataTableRoleFilter`'s use of `useTableConfig().router`, but deliberately uses `router.replace`
(falling back to `router.push` when `replace` is undefined) instead of `push`, since writes happen on
every debounced keystroke rather than a single discrete click — using `push` would spam browser history.
Unlike `DataTableRoleFilter`, it never touches a `page` URL param: this component isn't wired to any
table's row pagination, so resetting a `page` param here would be an unrelated side effect.

### Trigger label & custom rendering

`selectedOption` (`options.find((o) => o.value === value)`) and `selectedLabel` are only resolved
when `value` is non-empty; an empty `value` always renders `placeholder ?? allLabel ?? t('all')`. This
guards against the falsy-but-defined `''` value being treated as a real selection by a chain of `??`
fallbacks — see Amendments.

An optional `renderSelected?: (option: Option | undefined, value: string) => React.ReactNode` prop
lets a consumer fully replace the trigger's content (e.g. an avatar + name, a status badge) instead of
the default label `<span>`. It's only invoked when `value` is non-empty — same trigger label logic
`SearchableSelect` gained in the same amendment, keeping the two components' trigger APIs consistent.

### Export — `src/index.ts`

```ts
export { AsyncSearchableSelect } from './components/async-searchable-select'
export type { AsyncSearchableSelectProps } from './components/async-searchable-select'
```

### i18n — `src/hooks/use-table-translations.ts`

Reuses `'search'`, `'all'`, `'no-items-found'` from `DEFAULT_TRANSLATIONS`; adds `'loading'`,
`'loading-more'`, `'load-error'`.

## Alternatives

| Approach | Pros | Cons |
|---|---|---|
| Scroll-event listener instead of `IntersectionObserver` | No new browser API needed | Requires manual throttling, less idiomatic, worse performance |
| Reuse `FilterSerializer`/`SerializedResult` for the search text | Consistent with column-filter URL serialization | Overkill — those model multi-value filter serialization for a known column id; a free-text query param is a single string |
| Extend `SearchableSelect` with a `fetchOptions`/`mode` prop | One fewer file | Complex branching in an already-shipped component; conflates static and async concerns |
| **New `AsyncSearchableSelect` sibling (this proposal)** | Clean API, `SearchableSelect` untouched, single-purpose components | One more file, some shared trigger/UI markup between the two |

## Trade-offs

- **No caching**: every popover reopen refetches page 1, even if the search text is unchanged. Simple
  and consistent with the rest of the library's no-cache-layer design; costs one network round trip per
  reopen.
- **Consumer supplies `selectedLabel`**: the component can't resolve a selected-but-unloaded option's
  label itself without assuming an API shape.
- **New jsdom-only test dependency**: `IntersectionObserver`/`ResizeObserver` mocks were added to the
  shared `src/__tests__/setup.ts`, since jsdom implements neither — needed by this component's tests and
  reusable by any future async/scroll-based component's tests.

## Open Questions

- [ ] Should a future version add an opt-in in-memory page cache keyed by search term to avoid
  refetching page 1 on every reopen?
- [ ] Should `pageSize` read from a shared config default (similar to `search.debounceMs`) instead of a
  literal `20`, if more async components are added later?

## Amendments

### 2026-07-16 — Trigger label bug fix + `renderSelected` prop

While integrating this component against a real API in a consuming app (`web-road`'s attendance
person filter), two gaps surfaced in the shipped implementation:

- **Bug:** the trigger rendered blank instead of `placeholder` when `value === ''`. The original
  `selectedLabel` computation was
  `options.find(...)?.label ?? selectedLabelProp ?? value ?? undefined` — since `??` only treats
  `null`/`undefined` as absent, the empty string `value` satisfied `?? value` and the chain never
  reached `?? undefined`, so the trigger's `selectedLabel ?? placeholder ?? ...` fallback saw a
  defined (empty) string and never fell through to `placeholder`. Fixed by gating the whole
  computation on `value` being truthy: `value ? (... ?? value) : undefined`.
- **Addition:** added `renderSelected?: (option: Option | undefined, value: string) => React.ReactNode`
  so consumers can render something other than plain text for the selected value (an avatar, an
  icon + label pairing, a status badge). Applied identically to `SearchableSelect` (RFC 0003) for
  API consistency between the two components, since they share the same trigger markup.

Both changes are additive/bug-fix only — no existing prop signature changed, `renderSelected` is
optional and defaults to the pre-existing label rendering. No new RFC filed per the "bug fixes" and
"small, self-contained features" exclusions in `rfcs/README.md`; this amendment keeps the original
RFC accurate instead.

### 2026-07-16 — `Option.description` for the option row

A consuming app (`web-road`'s attendance person filter) needed each option row to show a person's
name and code together, with the code in small monospace — distinct from the trigger, which only
shows the name via `renderSelected`. `Option` gained an optional `description?: string` field;
when present, the option row renders it after `label` (`font-mono text-xs text-muted-foreground`,
`shrink-0` so a long `label` truncates instead of pushing it off). `Check` also gained `shrink-0` so
it doesn't compress when both `label` and `description` are present.

`description` lives on the shared `Option` type. Initially only `AsyncSearchableSelect`'s option row
rendered it; a second consumer (`web-road`'s daily-status person filter, using `SearchableSelect`)
needed the same treatment, so `SearchableSelect`'s option row (RFC 0003) got the identical
`description` + `shrink-0` Check treatment for consistency between the two components. Additive
only, defaults to no secondary text.

`SearchableSelect` filters client-side via cmdk's built-in fuzzy match against each `CommandItem`'s
`value` prop (unlike `AsyncSearchableSelect`, which searches server-side with `shouldFilter={false}`).
That `value` was `option.label` — splitting `label`/`description` would have silently broken
searching by the `description` text (e.g. an employee code) since it's no longer part of `label`.
Fixed by setting `value={description ? \`${label} ${description}\` : label}` so cmdk still matches
against both, while the rendered row keeps them visually separate.

No new RFC per the same "small, self-contained features" exclusion.
