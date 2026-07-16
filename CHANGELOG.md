# Changelog

## 0.1.19

### Bug Fixes

- Fix toolbar layout shifting depending on whether the table/card view toggle is rendered — the view-toggle segmented control in `DataTableToolbar` and `DataTableMobileToolbar` used `p-0.5` padding, making it taller than the other toolbar controls and shifting the row height between tables with `viewToggle` enabled and those without it; reduced to `p-0.25` so the control's height lines up with its siblings

### Contributors

- @elsieej

## 0.1.18

### Features

- Add `AsyncSearchableSelect` — a debounced, paginated combobox for remote-fetched options (search-as-you-type with cancellation of stale responses, infinite scroll via `IntersectionObserver`, optional URL sync of the search term); adds `AsyncOptionsFetchParams`, `AsyncOptionsFetchResult`, and `AsyncOptionsFetcher` types
- Add `renderSelected?: (option, value) => ReactNode` prop to `SearchableSelect` for fully custom trigger content when a value is selected (avatars, icon + label pairs, status badges); only invoked when `value` is non-empty, otherwise falls back to the existing placeholder/label rendering
- Add optional `description?: string` field to `Option`, rendered as secondary text next to an option's label in `SearchableSelect` and included in the search match text

### Bug Fixes

- Fix the row-number (`withIndex`) column resetting to 1 on every page when using `isQueryPagination` + `paginationData` without a router — `DataTable`'s internal pagination state was derived only from the URL `page` query param, so it never advanced when pagination was driven directly by `paginationData.paginationResponse.meta.current_page`; it now reads the current page/page size from `paginationResponse.meta` whenever `isQueryPagination` is active
- Simplify `ClientSideTable`'s row-number column to compute a row's position as `pageIndex * pageSize + positionInPage + 1`, replacing a nested ternary that could misnumber rows

### Tests

- Add coverage for three previously-untested RFCs: configurable filter serialization (`dotSeparated`/`commaSeparated`/`pipeSeparated`/`multiKey`), the `SearchableSelect` combobox, and the responsive toolbar breakpoint (`max-lg`/`lg`) contract
- Add regression tests locking in correct row numbering across pages for both client-side and query/server-driven (`isQueryPagination`) pagination

### Contributors

- @elsieej

## 0.1.17

### Bug Fixes

- Replace `ChevronsUpDown` with `ChevronDown` icon in `SearchableSelect` trigger button — the double-chevron implied a resizable/draggable interaction; a single down-chevron better matches the dropdown affordance

### Contributors

- @elsieej

## 0.1.16

### Features

- Sync `viewMode` to URL query param (`?view=table|cards`) via the router adapter in uncontrolled mode — the active view is written to `?view=` on change and omitted when it matches `defaultViewMode`; controlled mode (`viewMode` prop provided) never touches the URL; initial state is seeded from `?view=` on mount

### Changes

- Fix `viewMode` URL sync effect dependency array — replaced `createQueryString` closure dependency (which caused the effect to re-run on every filter/pagination URL change) with direct `router.getSearchParams()` / `router.getPathname()` reads inside the effect body; deps are now `[viewModeProp, router, viewMode, defaultViewMode]`; removed `// eslint-disable-next-line react-hooks/exhaustive-deps` suppression

### Contributors

- @elsieej

## 0.1.15

### Features

- Add `viewMode` / `onViewModeChange` controlled props to `DataTable` and `ClientSideTable` — when `viewMode` is provided the active mode is fully driven externally; when omitted the component stays uncontrolled (seeded from `defaultViewMode` in config); `onViewModeChange` fires on every toggle in both modes
- Fix view mode toggle disappearing on mobile — the Bảng/Thẻ toggle was only rendered inside `max-lg:hidden` (desktop toolbar); `DataTableMobileToolbar` now accepts `viewMode` / `onViewModeChange` and renders an icon-only compact toggle (guarded by `config.features.viewToggle`) as the first item in the mobile toolbar row
- Add `onRowClick?: (row: Row<TData>) => void` to `DataTableCardView`, `DataTable`, and `ClientSideTable` — clicking any card calls the callback with the full TanStack `Row` (use `row.original` for raw data); `cursor-pointer` is applied automatically when the prop is set; default card path attaches `onClick` directly to `<Card>`; `renderCard` path wraps the custom node in a `<div>` with `onClick`; fully opt-in with no behavior change when omitted

### Contributors

- @elsieej

## 0.1.14

### Bug Fixes

- Fix empty state and card view not filling container height — card mode wrapper now receives `cardClassName` (same as table mode) so consumer-supplied height constraints (`flex-1 min-h-0`, fixed heights, etc.) apply consistently to both view modes
- Fix table mode empty state dead space — the empty state is no longer rendered inside a `<TableRow>`; instead it is a `flex-1` sibling div of `<Table>` within a `flex flex-col` scroll wrapper, so it fills and vertically centers within the full available height rather than leaving empty background below a short table row
- Fix spacing between toolbar and content card being silently overridden — `mt-3` was in the base classes merged with `cardClassName` via `tailwind-merge`, so a consumer-supplied `mt-0` (as shown in prop docs) zeroed the gap; spacing is now `pb-3` on the toolbar wrapper div which is unaffected by `cardClassName`
- Fix inconsistent layout between table and card view modes — card mode now uses the same outer `Card` + `border-t` pagination structure as table mode (single card, pagination embedded with a separator) instead of two separate floating cards; `cardClassName` and `paginationFooterClassName` apply to both modes identically
- Fix empty state text not centered — table mode empty state `<div className="space-y-1">` was missing `text-center`, causing the heading and hint to be left-aligned while the icon above was centered
- Fix empty state vertical position inconsistency when toggling views — in table mode the empty state sits below the `h-10` column header row; card mode had no equivalent offset so the text appeared higher after switching; a `h-10 shrink-0` spacer is now prepended to the card view empty state to match the header height and keep content at the same position in both modes

### Contributors

- @elsieej

## 0.1.13

### Features

- `DataTableCardView`: when `renderCard` is provided the row is now rendered directly via `React.Fragment` — the `Card`/`CardContent` shell, checkbox, and row-index header are **not** added, giving the render prop full control over the card's DOM structure (e.g. hero images, click-to-open wrappers)
- Add `gridClassName?: string` prop to `DataTableCardView` — extra Tailwind classes merged onto the grid wrapper (e.g. `xl:grid-cols-4 overflow-y-auto`) without replacing the base responsive grid
- Add `cardGridClassName?: string` prop to `DataTable` and `ClientSideTable` — forwarded as `gridClassName` to `DataTableCardView` and applied to the loading-skeleton grid so both states share the same layout
- Add `defaultViewMode: 'table' | 'cards'` to `TableFeatureFlags` — sets the initial view mode when `viewToggle` is enabled; defaults to `'table'` in `DEFAULT_TABLE_CONFIG`; `DataTable` now reads `resolvedConfig.features.defaultViewMode` to seed its internal `viewMode` state instead of hardcoding `'table'`

### Contributors

- @elsieej

## 0.1.12

### Features

- Add `renderCard?: (row: Row<TData>) => React.ReactNode` prop to `DataTableCardView`, `DataTable`, and `ClientSideTable` — when provided, replaces the default field-value cell list inside each card body while preserving the checkbox, row-index header, and card selection styles; gives full control over card layout (e.g. hero images, custom typography)
- Add `cardHidden?: boolean` to `DataTableColumnMeta` — columns with this meta flag are skipped in the default card rendering without affecting the table view or requiring a full `renderCard` override

### Contributors

- @elsieej

## 0.1.11

### Features

- Support `Infinity` as `defaultPageSize` (config) or `pageSize` prop — passing `Infinity` opts the table into "show all" mode; `effectivePageSize` is resolved to `data.length` so TanStack Table always receives a finite value and avoids the `0 × Infinity = NaN` slice bug; skeleton rows fall back to 10 in this mode; `per_page` is omitted from the URL rather than written as `Infinity`

### Bug Fixes

- Fix `defaultPageSize` config being silently ignored — `per_page` URL param defaulted to the hardcoded string `"10"` instead of `resolvedPageSize`, so `config.pagination.defaultPageSize` had no effect when no `?per_page=` param was present in the URL
- Fix spurious dev warning when `defaultPageSize` is non-finite — `runDevValidation` now skips the `pageSizeOptions` membership check for `Infinity` (and any non-finite value) since it is an intentional sentinel, not a misconfiguration

### Contributors

- @elsieej

## 0.1.10

### Features

- Add `actionButtons?: React.ReactNode` prop to `ClientSideTable`, `DataTable`, `DataTableToolbar`, and `DataTableMobileToolbar` — renders inline alongside other toolbar controls on desktop, and **outside** the mobile filter drawer on mobile; designed for action buttons (e.g. Add) that are semantically unrelated to filtering
- Add `mobileGroup?: 'action' | 'filter'` field to `CustomButtonProps` — for array-form `customButtons`, buttons tagged `'action'` render outside the filter drawer on mobile; `'filter'` (default) renders inside the drawer, preserving full backwards compatibility

### Bug Fixes

- Fix Filter drawer trigger appearing on tables with no filter content — the Filter button and drawer are now conditionally hidden when there are no searchable columns, filterable columns, advanced filters, or filter-group custom buttons; tables with only action buttons no longer show an empty drawer

### Contributors

- @elsieej

## 0.1.9

### Features

- Add `SearchableSelect` — standalone combobox (Popover + Command + CommandInput) for searchable filter dropdowns usable in `customButtons` without any TanStack Table column coupling; exported as `SearchableSelect` and `SearchableSelectProps` (RFC 0003)
- Add `isQuerySearch` / `searchableQuery` props to `DataTableMobileToolbar` — query search input now renders inline in the mobile toolbar row, always visible without opening the filter drawer

### Bug Fixes

- Fix sticky table header — `TableHeader` is now `sticky top-0 z-10 bg-muted`; removed `overflow-auto` from the `Table` wrapper so the header actually sticks during vertical scroll
- Fix `drawer.tsx` TS2742 build error — replace inferred vaul re-exports with explicit portable React/DOM type annotations so `tsup` generates clean ESM + CJS + DTS output without the `--no-dts` workaround

### Changes

- Change toolbar breakpoint from `md` (768 px) to `lg` (1024 px) — tablets and iPads now consistently use the mobile drawer toolbar (RFC 0002)
- At `lg`–`xl` (1024–1279 px), search input and action buttons each wrap to their own full-width row; at `xl`+ (≥ 1280 px) all controls sit in a single inline row

### Contributors

- @elsieej

## 0.1.8

### Bug Fixes

- Fix custom buttons in `DataTableMobileToolbar` not closing the drawer on click — buttons are now wrapped with `DrawerClose asChild` so tapping a custom action dismisses the drawer as expected
- Fix `useTableTranslations` ignoring instance-level i18n config — the hook now checks the resolved 4-layer config (via `useResolvedTableConfigContext`) before falling back to global config, so per-instance `translationFn` overrides are respected
- Fix `new URLSearchParams()` being recreated on every render in `DataTable` when no router is provided — stabilized with `useRef` to avoid unnecessary re-renders

### Features

- `useTableTranslations` now picks up i18n overrides set at the instance level (config prop on `<DataTable>`) and plugin level, not just the global `<TableConfigProvider>`

### Contributors

- @elsieej

## 0.1.5

### Bug Fixes

- Fix `useTableConfig()` returning global config instead of fully resolved config inside `<DataTable>` — child components now correctly receive instance-level overrides and plugin config (all 4 layers)

### Features

- Add `ResolvedTableConfigContext` so child components access the resolved config via `useTableConfig()`
- Add skeleton loading rows for table view when `isLoading` is true
- Add skeleton loading cards for card view when `isLoading` is true

### Contributors

- @elsieej — original PR with the config resolution fix idea and loading state enhancement

## 0.1.4

- Add cursor-based pagination support (`isCursorPagination` mode) for APIs like GraphQL Relay and Stripe
- New `CursorPaginationInfo` and `CursorPaginationData` exported types
- Renders Prev/Next buttons only (no numbered pages) with optional total count display
- Page size selector and RTL support included
- `pageCount` prop is now optional across `DataTable` and `ClientSideTable`
- Discriminated union types prevent mixing cursor and offset pagination props

## 0.1.0 (Initial Release)

- Core `DataTable` component with sorting, filtering, pagination
- `ClientSideTable` wrapper with auto-index column
- Advanced filter builder UI
- Card view and table view toggle
- CSV export support
- Full i18n support with configurable translation function
- Router adapter pattern for framework-agnostic URL sync
- 4-layer config system with `TableProvider`
- Plugin architecture for extending config
- RTL support
- Mobile-responsive toolbar with drawer
- Floating action bar for bulk operations
- Column visibility toggle
- Role-based filtering
- Faceted and single-select filters
- Loading skeleton
- Row actions with dropdown and individual button modes
