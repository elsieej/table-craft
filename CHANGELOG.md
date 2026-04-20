# Changelog

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
