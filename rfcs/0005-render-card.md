# RFC: Custom Card Rendering (`renderCard`, `cardHidden`, `gridClassName`, `defaultViewMode`)

> **Status:** Implemented
> **Author:** Elsie
> **Created:** 2026-07-16 (retroactive — shipped in v0.1.12 / v0.1.13)
> **Commit:** 70db890493805ec9c48f1ed26d97621837e51d0b

---

## Summary

Gives consumers full control over the card view's per-row rendering and layout instead of the fixed field-value list that `DataTableCardView` generated automatically, plus a config-driven initial view mode so tables can default to the card layout without a controlled prop.

## Motivation

`DataTableCardView` only rendered a generic list of `column: value` pairs inside a fixed `Card`/`CardContent` shell. Consumers needing richer card layouts (hero images, custom typography, click-to-open wrappers) had no way to customize the card body, and every column always appeared in the card even when it didn't make sense there (e.g. an `actions` column). Tables that should start in card view also had no way to do so — `viewMode` was hardcoded to `'table'` on mount.

```tsx
// Before: cards always rendered the default field-value list, always started in table view
<DataTableCardView table={table} />
```

## Goals

- Let consumers fully replace a card's body via a render prop while keeping the checkbox, row-index header, and selection styling intact.
- Let consumers hide specific columns from the default card rendering without adopting a full `renderCard` override.
- Let consumers extend the card grid's Tailwind layout (e.g. more columns on wide screens) without losing the base responsive grid.
- Let consumers configure which view (`'table' | 'cards'`) a table starts in when `viewToggle` is enabled.

## Non-Goals

- Changing the table view's cell rendering.
- Making `viewMode` itself config-driven after mount (it remains local `useState`, seeded once from config).

## API Design

### Types

```typescript
type DataTableColumnMeta = {
  thClassName?: string
  tdClassName?: string
  cardHidden?: boolean // NEW — skip this column in default card rendering
}

export interface DataTableCardViewProps<TData> {
  table: Table<TData>
  renderCard?: (row: Row<TData>) => React.ReactNode // NEW
  gridClassName?: string // NEW — merged onto the grid wrapper
}

export interface TableFeatureFlags {
  // ...existing flags
  defaultViewMode: 'table' | 'cards' // NEW — initial viewMode when viewToggle is enabled
}
```

### Component API

```tsx
// Full control over card body; checkbox/index header/selection styles preserved
<DataTable
  renderCard={(row) => (
    <div className="p-4">
      <img src={row.original.heroImage} />
      <h3>{row.original.title}</h3>
    </div>
  )}
  cardGridClassName="xl:grid-cols-4 overflow-y-auto"
/>

// Hide a column from the default card body without a full renderCard override
const columns = [
  {
    id: 'actions',
    meta: { cardHidden: true },
    // ...
  },
]

// Start a table in card view by default
<DataTable
  config={{ features: { defaultViewMode: 'cards' } }}
/>
```

## Architecture Integration

### Config System

`defaultViewMode` lives on `TableFeatureFlags` (Layer 1 default: `'table'` in `DEFAULT_TABLE_CONFIG`), flowing through the existing 4-layer resolution. `DataTable` seeds its `viewMode` state once from `resolvedConfig.features.defaultViewMode ?? 'table'` instead of hardcoding `'table'`; it remains an uncontrolled `useState` after mount.

### Components

- `DataTableCardView` — accepts `renderCard` and `gridClassName`. When `renderCard` is provided, each row is rendered via `React.Fragment` with no `Card`/`CardContent` shell, checkbox, or index header — the render prop owns the entire card DOM. Without it, the existing default rendering applies, now filtering out any column whose `meta.cardHidden` is `true`.
- `DataTable` / `ClientSideTable` — forward `renderCard` and `cardGridClassName` (as `gridClassName`) to `DataTableCardView`, and apply `cardGridClassName` to the loading-skeleton grid so both states share layout.

## Alternatives

| Approach | Pros | Cons |
|----------|------|------|
| `renderCard` render prop (chosen) | Full layout control; opt-in, doesn't affect table view | Consumer owns selection/index UI when used |
| Slot-based customization (e.g. `cardHeader`/`cardFooter` props) | Keeps default shell for consumers who only want partial control | More API surface; doesn't solve the "hero image as the whole card" case |
| CSS-only theming of the default card | No new props | Can't restructure DOM (e.g. image above vs. inside content) |

## Trade-offs

- **Bundle size:** Negligible — one render prop, one meta flag, one config field.
- **Complexity:** When `renderCard` is used, the consumer re-implements selection/index affordances themselves if needed; documented as a trade-off rather than hidden.
- **Performance:** No measurable runtime cost.

## Backward Compatibility

- **Does this break any existing API?** No. All new props/flags are optional; default behavior (`renderCard` unset, `cardHidden` unset, `defaultViewMode: 'table'`) is unchanged from pre-0.1.12 behavior.
- **Can this be adopted incrementally?** Yes.
- **Migration path:** None required.

## Open Questions

- [ ] Should `renderCard` receive helpers for the checkbox/index header so consumers can opt back into them selectively instead of an all-or-nothing shell?

## Adoption Plan

Already shipped and released:

1. `renderCard` prop + `cardHidden` meta — v0.1.12
2. `gridClassName`/`cardGridClassName` + `defaultViewMode` — v0.1.13
