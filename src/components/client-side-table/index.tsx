'use client'

import * as React from 'react'
import { Column, ColumnDef, Row, Table } from '@tanstack/react-table'
import { DataTable } from '../data-table'
import { DataTableColumnHeader } from '../data-table-column-header'
import { CustomButtonProps } from '../table-actions-row'
import { useTableTranslations } from '../../hooks/use-table-translations'
import type { TableConfigInput } from '../../types/table-config'
import { Pagination, CursorPaginationData } from '../../types/pagination'
import {
  DataTableFilterableColumn,
  DataTableQuerySearchable,
  DataTableSearchableColumn,
} from '../../types/table'
import { FilterOptions } from '../../types/filter-options'

type BaseProps<TData, TValue> = {
  data: TData[]
  pageCount?: number
  pageSize?: number
  columns: ColumnDef<TData, TValue>[]
  showFilter?: boolean
  showPagination?: boolean
  addItemPagePath?: {
    url: string
    text?: string
  }
  isShowExportButtons?: {
    isShow: boolean
    ignoredCols?: string[]
    fileName?: string
  }
  customButtons?: CustomButtonProps[] | React.ReactElement
  /** Always rendered inline (desktop) and outside the mobile filter drawer. Use for action buttons like Add. */
  actionButtons?: React.ReactNode
  withIndex?: boolean
  isLoading?: boolean
  customCss?: string
  isShowAdvancedFilter?: boolean
  config?: TableConfigInput
  cardClassName?: string
  cardContentClassName?: string
  toolbarClassName?: string
  paginationFooterClassName?: string
  renderCard?: (row: Row<TData>) => React.ReactNode
  /** Controlled active view mode. When provided the component is fully controlled; omit to use internal state seeded by `defaultViewMode`. */
  viewMode?: 'table' | 'cards'
  /** Called whenever the active view mode changes. */
  onViewModeChange?: (mode: 'table' | 'cards') => void
  /** Called when a card is clicked in card view. Receives the TanStack row — use `row.original` for the raw data. */
  onRowClick?: (row: Row<TData>) => void
}

type QueryFilterProps<TData, TValue> = {
  isQueryFilter: true
  handleFilterChange: (key: keyof FilterOptions, value: string | number | undefined) => void
  filterableQuery: DataTableFilterableColumn<TData>[]
  filterableColumns?: never
  currentFilters?: FilterOptions
  onClearFilters?: () => void
}

type LocalFilterProps<TData, TValue> = {
  isQueryFilter?: false
  handleFilterChange?: never
  filterableQuery?: never
  filterableColumns?: DataTableFilterableColumn<TData>[]
  currentFilters?: never
  onClearFilters?: never
}

type QuerySearchProps<TData, TValue> = {
  isQuerySearch: true
  searchableQuery: DataTableQuerySearchable<TData>[]
  searchableColumns?: never
}

type LocalSearchProps<TData, TValue> = {
  isQuerySearch?: false
  searchableQuery?: never
  searchableColumns?: DataTableSearchableColumn<TData>[]
}

type QueryPaginationProps<TData, TValue> = {
  isQueryPagination: true
  paginationData: {
    paginationResponse: Pagination
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  isCursorPagination?: never
  cursorPaginationData?: never
}

type LocalPaginationProps<TData, TValue> = {
  isQueryPagination?: false
  paginationData?: never
  isCursorPagination?: never
  cursorPaginationData?: never
}

type CursorPaginationProps<TData, TValue> = {
  isCursorPagination: true
  cursorPaginationData: CursorPaginationData
  isQueryPagination?: never
  paginationData?: never
}

type TasksTableShellProps<TData, TValue> = BaseProps<TData, TValue> &
  (QuerySearchProps<TData, TValue> | LocalSearchProps<TData, TValue>) &
  (QueryPaginationProps<TData, TValue> | LocalPaginationProps<TData, TValue> | CursorPaginationProps<TData, TValue>) &
  (QueryFilterProps<TData, TValue> | LocalFilterProps<TData, TValue>)

export function ClientSideTable<TData, TValue>({
  data,
  pageCount,
  pageSize,
  columns: initialColumns,
  searchableColumns = [],
  showFilter = true,
  showPagination = true,
  filterableColumns = [],
  addItemPagePath,
  isShowExportButtons = {
    isShow: true,
    ignoredCols: [],
    fileName: '',
  },
  customButtons,
  actionButtons,
  withIndex = true,
  isQueryPagination = false,
  paginationData,
  isCursorPagination,
  cursorPaginationData,
  isLoading = false,
  isQuerySearch = false,
  searchableQuery = [],
  isQueryFilter = false,
  handleFilterChange,
  filterableQuery,
  currentFilters,
  onClearFilters,
  customCss,
  isShowAdvancedFilter = false,
  config,
  cardClassName,
  cardContentClassName,
  toolbarClassName,
  paginationFooterClassName,
  renderCard,
  viewMode,
  onViewModeChange,
  onRowClick,
}: TasksTableShellProps<TData, TValue>) {
  const t = useTableTranslations()

  const columns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    return [
      ...(withIndex
        ? [
            {
              accessorKey: 'i',
              header: ({ column }: { column: Column<TData> }) => (
                <DataTableColumnHeader column={column} title={t('row-number')} />
              ),
              cell: ({ row, table }: { row: Row<TData>; table: Table<TData> }) => (
                <div className="w-full">
                  {table.getState().pagination.pageIndex + 1 === 1
                    ? row.index + 1
                    : table.getState().pagination.pageIndex + 1 > 1
                      ? table.getState().pagination.pageIndex *
                          table.getState().pagination.pageSize +
                        (row.index + 1)
                      : row.index + 1}
                </div>
              ),
              enableSorting: false,
              enableHiding: false,
            },
          ]
        : []),
      ...initialColumns,
    ]
  }, [initialColumns, withIndex, t])

  return (
    <DataTable
      columns={columns}
      data={data}
      pageCount={pageCount}
      pageSize={pageSize}
      showFilter={showFilter}
      showPagination={showPagination}
      addItemPagePath={addItemPagePath}
      isShowExportButtons={isShowExportButtons}
      customButtons={customButtons}
      actionButtons={actionButtons}
      floatingBar={true}
      isLoading={isLoading}
      customCss={customCss}
      isShowAdvancedFilter={isShowAdvancedFilter}
      config={config}
      cardClassName={cardClassName}
      cardContentClassName={cardContentClassName}
      toolbarClassName={toolbarClassName}
      paginationFooterClassName={paginationFooterClassName}
      renderCard={renderCard}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      onRowClick={onRowClick}
      {...(isQuerySearch
        ? { isQuerySearch: true as const, searchableQuery: searchableQuery }
        : {
            isQuerySearch: false as const,
            searchableColumns: searchableColumns,
          })}
      {...(isCursorPagination && cursorPaginationData
        ? { isCursorPagination: true as const, cursorPaginationData }
        : isQueryPagination && paginationData
          ? { isQueryPagination: true as const, paginationData }
          : { isQueryPagination: false as const })}
      {...(isQueryFilter && handleFilterChange
        ? {
            isQueryFilter: true as const,
            handleFilterChange,
            filterableQuery: filterableQuery || [],
            currentFilters: currentFilters,
            onClearFilters: onClearFilters,
          }
        : {
            isQueryFilter: false as const,
            filterableColumns: filterableColumns || [],
          })}
    />
  )
}
