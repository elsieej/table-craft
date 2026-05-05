# RFC: Responsive Toolbar Breakpoint Strategy

> **Status:** Implemented
> **Author:** elsie
> **Created:** 2026-05-02

---

## Summary

Change the toolbar breakpoint from `md` (768 px) to `lg` (1024 px) so that tablets and iPads use the mobile drawer-based toolbar. On the desktop toolbar (≥ `lg`), make the search input take full width at the `lg`–`xl` range so it does not collapse when many `customButtons` (filters, action buttons) are present.

## Motivation

With the old `md` breakpoint, iPads and tablets in landscape mode (≥ 768 px) rendered the desktop toolbar. When `customButtons` contained several `<Select>` dropdowns plus an Add button, the search input collapsed to near-zero width because all flex siblings competed for the same row.

```
Before (md breakpoint, iPad 768 px):
┌──────────────────────────────────────────────────────────────┐
│ [🔍] [Area ▼] [Status ▼] [Feature ▼] [CameraServer ▼]       │  ← search crushed
│ [+ Add]                                                       │  ← wraps to row 2
└──────────────────────────────────────────────────────────────┘
```

## Goals

- Tablets (768–1023 px) always use the mobile drawer toolbar — one consistent, uncluttered UI.
- Desktop toolbar (≥ 1024 px) never collapses the search input.
- At `lg`–`xl` (1024–1279 px, small laptops / iPad landscape): search takes its own full-width row; filters + Add button appear on a second row.
- At `xl`+ (≥ 1280 px, standard laptops/desktops): all controls inline in one row.
- On mobile toolbar (< 1024 px): `searchableQuery` search input is rendered **inline in the toolbar row** (outside the filter drawer), so it is always visible without opening the drawer.

## Non-Goals

- Changing the drawer content or mobile UX beyond the breakpoint shift.
- Removing `customButtons` as a `ReactElement` — consumers keep full control of what renders in the toolbar.

## API Design

No public API changes. The breakpoint and layout are internal to `DataTableToolbar` and `DataTable`.

## Architecture Integration

### Breakpoint change (`data-table.tsx`)

```tsx
// Before
<div className="max-md:hidden">   {/* desktop toolbar */}
<div className="md:hidden">       {/* mobile toolbar  */}

// After
<div className="max-lg:hidden">   {/* desktop toolbar */}
<div className="lg:hidden">       {/* mobile toolbar  */}
```

### Search input full-width at `lg` (`data-table-toolbar.tsx`)

```tsx
// Before
<div className="flex flex-1 min-w-[200px] items-center gap-3">

// After — basis-full collapses to its own row at lg; xl:basis-auto goes inline at xl+
<div className="flex flex-1 min-w-[200px] basis-full xl:basis-auto items-center gap-3">
```

The actions/buttons wrapper mirrors the same breakpoint so both rows align:

```tsx
// Before
<div className="flex flex-wrap items-center gap-2">

// After
<div className="flex flex-wrap items-center gap-2 basis-full xl:basis-auto">
```

### Search input on mobile (`data-table-mobile-toolbar.tsx`)

For `isQuerySearch=true`, the search input is rendered **inline in the toolbar row**, outside the filter drawer, so it is always visible:

```tsx
// Outer toolbar row — flex-1 so search takes remaining width
<div className="flex flex-1 items-center gap-2">
  {isQuerySearch && searchableQuery.length > 0 &&
    searchableQuery.map((column) => (
      <div className="relative flex-1" key={String(column.id)}>
        <Search className="absolute start-3 top-2 h-4 w-4 text-muted-foreground" />
        <Input ... className="ps-9 h-8 w-full" />
      </div>
    ))
  }
  <DrawerTrigger>...</DrawerTrigger>
  {/* Export / Add buttons */}
</div>
```

### Result

| Viewport | Toolbar shown | Search | Filters + Add |
|---|---|---|---|
| < 1024 px (mobile / tablet) | Mobile drawer | **Inline in toolbar row** | Inside drawer |
| 1024–1279 px (lg, small laptop) | Desktop | Full-width row | Second row, wraps |
| ≥ 1280 px (xl+, laptop/desktop) | Desktop | Inline | Inline, wraps if needed |

## Alternatives

| Approach | Pros | Cons |
|---|---|---|
| Keep `md` breakpoint, fix layout with `flex-wrap` | Minimal change | Search still collapses on iPad |
| Use `xl` breakpoint | Very wide mobile drawer | Wastes desktop space on 1024–1280 px screens |
| **This proposal (`lg` breakpoint + `xl` search wrap)** | Clean separation, search always visible | Drawer on 1024 px iPad landscape (acceptable) |

## Trade-offs

- **Bundle size:** No change — only Tailwind class strings change.
- **Complexity:** Zero new props or types.
- **Backward compatibility:** Visual-only change; no API breakage.

## Open Questions

- [ ] Should `toolbarBreakpoint` be a config option (e.g. `'md' | 'lg' | 'xl'`) for consumers who need custom breakpoints?
