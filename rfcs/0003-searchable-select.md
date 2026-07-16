# RFC: SearchableSelect — Standalone Combobox Filter

> **Status:** Implemented
> **Author:** elsie
> **Created:** 2026-05-02

---

## Summary

Add a `SearchableSelect` component — a standalone combobox (Popover + Command + CommandInput) for
use in `customButtons` when filter options need to be searchable. This replaces plain `<Select>`
dropdowns that have no built-in search, causing poor UX when option lists are long (e.g. dozens
of areas or camera servers).

Also fixes `src/components/ui/drawer.tsx` to carry explicit type annotations so that the full
build (ESM + CJS + DTS) succeeds without `--no-dts`.

## Motivation

The camera admin and user admin table toolbars render filter dropdowns via `customButtons`:

```
[Area ▼]  [Status ▼]  [Feature ▼]  [Camera Server ▼]  [+ Add]
```

These are plain Shadcn `<Select>` components. When option lists grow (areas, org units, camera
servers are populated from API), users must scroll a flat list with no way to search. The existing
table-craft filter components (`DataTableFacetedFilter`, `DataTableSingleSelectFilter`) already use
Command-based searchable popovers, but they are coupled to TanStack Table's column/filter API and
cannot be used standalone inside `customButtons`.

```
Before (plain <Select>, no search):
┌─────────────────────────────────────┐
│ Select area...                   ▼  │
│ ─────────────────────────────────── │
│   All areas                         │
│   Floor 1                           │
│   Floor 2                           │
│   Floor 3                           │
│   ... (scroll to find)              │
└─────────────────────────────────────┘
```

## Goals

- A standalone, dependency-free combobox usable in any React context — no TanStack Table column
  required.
- Searchable: typing in `CommandInput` filters displayed options in real time.
- Single-select with an explicit "All" row that clears the selection.
- Consistent design with existing table-craft filter components.
- Drop-in width replacement for `<Select className="w-40">` etc.
- Full DTS output — no more `--no-dts` workaround for the build.

## Non-Goals

- Multi-select (use `DataTableFacetedFilter` for that).
- Integration with table column filters (use `DataTableSingleSelectFilter` for that).
- Async/remote search — options are passed as a static array.

## API Design

```tsx
export interface SearchableSelectProps {
  value: string              // '' = nothing selected (shows placeholder)
  onValueChange: (value: string) => void  // '' emitted when "All" selected
  options: Option[]          // { value: string; label: string; icon?: ComponentType }[]
  placeholder?: string       // Trigger label when value === ''
  searchPlaceholder?: string // Defaults to t('search') + '...'
  allLabel?: string          // "All" row label; defaults to t('all')
  emptyText?: string         // Shown when search finds nothing; defaults to t('no-items-found')
  className?: string         // Applied to trigger button (controls width)
  disabled?: boolean
  // Overrides the trigger's selected-value content; only called when value is non-empty. See
  // Amendments (2026-07-16).
  renderSelected?: (option: Option | undefined, value: string) => React.ReactNode
}
```

### Value convention

`value` uses `''` (empty string) to mean "nothing selected / show all". Consumers convert to their
own empty sentinel before calling `handleMultiSearchChange`:

```tsx
<SearchableSelect
  value={currentArea}                                              // '' when unfiltered
  onValueChange={(v: string) => handleMultiSearchChange('areaId', v ? [v] : [])}
  options={areaOptions}
  placeholder={t('filterArea')}
  allLabel={t('filterAreaAll')}
  className="w-40"
/>
```

Derived current values use `''` instead of `'all'`:

```ts
const currentArea = (searchValues.areaId as string[])[0] ?? ''
```

## Architecture Integration

### New component — `src/components/searchable-select.tsx`

Uses `Popover` + `Command` + `CommandInput` (same primitives as `DataTableFacetedFilter`).
Options are searched on the `label` field so typing matches human-readable text, not internal IDs.
The "All" row is in its own `CommandGroup` above a `CommandSeparator` so it always shows
regardless of search input.

```
After (SearchableSelect, with CommandInput):
┌─────────────────────────────────────┐
│ Area...                          ⌄  │  ← muted text when unselected
└─────────────────────────────────────┘
           ↓ open popover
┌─────────────────────────────────────┐
│ 🔍 Search...                        │  ← CommandInput, always visible
│ ─────────────────────────────────── │
│   All areas                    ✓    │  ← always visible, clears filter
│ ─────────────────────────────────── │
│   Floor 1                           │
│   Floor 2        ← type "floor" →   │
│   Floor 3                      ✓    │  ← selected option
└─────────────────────────────────────┘
```

### Export — `src/index.ts`

```ts
export { SearchableSelect } from './components/searchable-select'
export type { SearchableSelectProps } from './components/searchable-select'
```

### Adoption

Applied to both tables in `apps/web-road`:

| Table | Filters converted |
|---|---|
| `camera-admin-table` | Area, Status, Feature, Camera Server |
| `user-admin-table` | Status, Account, Org Unit |

Static option arrays (Status, Feature, Account) extracted to `useMemo` alongside existing dynamic
arrays (`areaOptions`, `cameraServerOptions`, `orgUnitOptions`) for consistency.

### DTS fix — `src/components/ui/drawer.tsx`

`vaul` re-exports `@radix-ui/react-dialog` components whose types reference internal pnpm paths
(e.g. `.pnpm/@radix-ui+react-dialog@1.1.15_.../node_modules/@radix-ui/react-dialog`). TypeScript
raises TS2742 during DTS generation and aborts. Fix: replace inferred assignments with explicit
portable type annotations using only standard React/DOM types:

```ts
// Before — type inferred, references internal pnpm path → TS2742
const DrawerTrigger = DrawerPrimitive.Trigger

// After — annotation uses only React built-ins, portable in any .d.ts
const DrawerTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }> =
  DrawerPrimitive.Trigger as never
```

The same pattern applies to `DrawerClose`. The `forwardRef` components (`DrawerOverlay`,
`DrawerContent`, `DrawerTitle`, `DrawerDescription`) are annotated with HTML element types instead
of `typeof DrawerPrimitive.X`:

```ts
// Before
const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,      // ← references pnpm path
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(...)

// After
const DrawerOverlay = React.forwardRef<
  HTMLDivElement,                                           // ← portable
  React.HTMLAttributes<HTMLDivElement>
>(...)
```

Internal prop/ref spreading uses `as never` casts to satisfy vaul's narrower types without leaking
them into the public API surface.

Result: `tsup` (with `dts: true`) now builds ESM + CJS + DTS in a single clean pass.

## Alternatives

| Approach | Pros | Cons |
|---|---|---|
| Extend `DataTableSingleSelectFilter` with standalone mode | Reuse existing code | Complex discriminated union, no `CommandInput` |
| Use `DataTableFacetedFilter` with `isQueryFilter` | Already has `CommandInput` | Multi-select semantics, requires full `FilterOptions` wiring |
| Keep `--no-dts` for the drawer issue | No code change to drawer | TypeScript consumers get no types; `SearchableSelect` not resolvable |
| **New `SearchableSelect` + drawer annotation fix (this proposal)** | Clean API, full types, zero coupling | Minimal new file; `as never` casts inside drawer |

## Trade-offs

- **Bundle size:** ~1 kB added — only Popover + Command primitives already bundled elsewhere.
- **Complexity:** Zero new config, flags, or types in the table config system.
- **Backward compatibility:** Fully additive — no existing public API changed. `drawer.tsx` prop
  surface is unchanged; only the internal type annotations differ.
- **`as never` in drawer:** The casts are isolated to the implementation body of `drawer.tsx` and
  do not affect the component's public props or ref types visible to consumers.

## Open Questions

- [ ] Should `SearchableSelect` support multi-select in a future version?
- [ ] Should `toolbarBreakpoint` be a config option so consumers can tune when `SearchableSelect`
  triggers collapse to the mobile drawer?

## Amendments

### 2026-07-16 — `renderSelected` prop

Added `renderSelected?: (option: Option | undefined, value: string) => React.ReactNode`, letting
consumers replace the trigger's default label `<span>` with custom content (an avatar, an icon +
label pairing, a status badge). Only invoked when `value` is non-empty — an empty selection always
falls back to `placeholder ?? allLabel ?? t('all')`, same as before.

Introduced alongside the identical addition to `AsyncSearchableSelect` (RFC 0004), which also fixed
a related bug where its (async-only) trigger rendered blank instead of the placeholder for an empty
selection — `SearchableSelect`'s own `selectedLabel = options.find(...)?.label` was never affected
by that bug, since a `''` value never matches a real option's `value`. See RFC 0004's Amendments for
the fix detail. Purely additive; no existing prop signature changed.
