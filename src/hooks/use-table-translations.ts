'use client'

import { useGlobalTableConfig, useResolvedTableConfigContext } from '../config/context'

/**
 * Built-in default English translation strings.
 * Used as fallback when no custom translationFn is provided.
 */
const DEFAULT_TRANSLATIONS: Record<string, string> = {
  // Toolbar
  'Filter': 'Filter',
  'filter-by': 'Filter by',
  'Reset': 'Reset',
  'add': 'Add',
  'add-filter': 'Add filter',
  'new': 'New',
  'columns': 'Columns',
  'Toggle-Visibility': 'Toggle Visibility',
  'export-csv': 'Export CSV',
  'tableView': 'Table',
  'cardView': 'Cards',
  'Apply': 'Apply',
  'data-table-filter': 'Use filters to narrow down results.',

  // Search
  'search': 'Search',

  // Async search
  'loading': 'Loading...',
  'loading-more': 'Loading more...',
  'load-error': 'Failed to load options.',

  // Sorting
  'asc': 'Asc',
  'desc': 'Desc',
  'Hide': 'Hide',
  'sorted-desc': 'Sorted descending',
  'sorted-asc': 'Sorted ascending',
  'not-sorted': 'Not sorted',
  'sort-ascending': 'Sort ascending',
  'sort-descending': 'Sort descending',
  'hide-column': 'Hide column',

  // Pagination
  'pagination': 'Pagination',
  'showing': 'Showing',
  'of': 'of',
  'records': 'records',
  'Rows Per Page': 'Rows per page',
  'previous': 'Previous',
  'next': 'Next',
  'first': 'First',
  'last': 'Last',

  // Selection
  'select': 'Select',
  'clear-selection': 'Clear selection',
  'row(s) selected': 'row(s) selected',
  'delete-selected': 'Delete selected',

  // Empty state
  'no-records-found': 'No records found',
  'no-records-hint': 'Try adjusting your search or filter criteria.',
  'reset-filters': 'Reset filters',

  // Filters
  'no-items-found': 'No items found.',
  'clear-filters': 'Clear filters',
  'all': 'All',
  'advanced-filter': 'Advanced filter',

  // Actions
  'actions': 'Actions',
  'edit': 'Edit',
  'show': 'Show',
  'delete': 'Delete',
  'download': 'Download',
  'cancel': 'Cancel',

  // Date
  'datePlaceholder': 'Pick a date',

  // Client-side table
  'row-number': '#',
}

/**
 * Translation hook for table components.
 *
 * If config provides a custom `translationFn`, uses that.
 * Otherwise falls back to built-in English strings.
 */
export function useTableTranslations(): (key: string) => string {
  const globalConfig = useGlobalTableConfig()
  const resolvedConfig = useResolvedTableConfigContext()
  const config = resolvedConfig ?? globalConfig

  if (config.i18n.translationFn) {
    return config.i18n.translationFn
  }

  return (key: string) => DEFAULT_TRANSLATIONS[key] ?? key
}
