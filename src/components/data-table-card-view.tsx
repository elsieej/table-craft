'use client'

import * as React from 'react'
import { flexRender, Row, Table } from '@tanstack/react-table'
import { Card, CardContent } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { useTableTranslations } from '../hooks/use-table-translations'
import { SearchX, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

type CardColumnMeta = { cardHidden?: boolean }

export interface DataTableCardViewProps<TData> {
  table: Table<TData>
  renderCard?: (row: Row<TData>) => React.ReactNode
  /** Extra classes merged onto the card grid (e.g. `xl:grid-cols-4 overflow-y-auto`). */
  gridClassName?: string
  /** Called when a card is clicked. Receives the TanStack row — use `row.original` for the raw data. */
  onRowClick?: (row: Row<TData>) => void
}

export function DataTableCardView<TData>({ table, renderCard, gridClassName, onRowClick }: DataTableCardViewProps<TData>) {
  const t = useTableTranslations()
  const rows = table.getRowModel().rows

  if (!rows.length) {
    return (
      <>
        <div className="h-10 shrink-0" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <SearchX className="size-10 text-muted-foreground/50" aria-hidden="true" />
          <div className="space-y-1 text-center">
            <p className="font-semibold">{t('no-records-found')}</p>
            <p className="text-sm text-muted-foreground">{t('no-records-hint')}</p>
          </div>
          {table.getState().columnFilters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1 gap-1.5"
              onClick={() => table.resetColumnFilters()}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              {t('reset-filters')}
            </Button>
          )}
        </div>
      </>
    )
  }

  const gridClass = cn('mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3', gridClassName)

  if (renderCard) {
    return (
      <div className={gridClass}>
        {rows.map((row) => (
          <div
            key={row.id}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(onRowClick && 'cursor-pointer')}
          >
            {renderCard(row)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {rows.map((row) => {
        const visibleCells = row.getVisibleCells()
        return (
          <Card
            key={row.id}
            data-state={row.getIsSelected() && 'selected'}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              'transition-colors data-[state=selected]:border-primary/50 data-[state=selected]:bg-primary/5',
              onRowClick && 'cursor-pointer'
            )}
          >
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label={t('select')}
                  className="size-4"
                />
                <span className="text-xs text-muted-foreground">
                  #{row.index + 1}
                </span>
              </div>
              <div className="space-y-2">
                {visibleCells.map((cell) => {
                  if (cell.column.id === 'select') return null
                  const meta = cell.column.columnDef.meta as CardColumnMeta | undefined
                  if (meta?.cardHidden) return null
                  const header = cell.column.columnDef.header
                  const headerLabel =
                    typeof header === 'string' ? header : cell.column.id
                  return (
                    <div key={cell.id} className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground capitalize shrink-0">
                        {headerLabel}
                      </span>
                      <span className="text-sm text-end">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
