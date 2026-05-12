# Changelog

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
