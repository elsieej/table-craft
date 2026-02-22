'use client'

import * as React from 'react'
import type { Table } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { exportSelectedRowsCsv } from '../lib/csv-export'
import { CalendarIcon, Check, Filter, ListFilter, Loader2, Plus, Rows3, Sheet, Type, X } from 'lucide-react'
import { useTableTranslations } from '../hooks/use-table-translations'

import type { DataTableFilterableColumn, DataTableSearchableColumn } from '../types/table'
import { cn } from '../lib/utils'
import { useTableConfig } from '../config'
import { Button } from './ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { Calendar } from './ui/calendar'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import type { DataTableFilterOption } from '../types/table'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableAdvancedFilterItem } from './advanced/data-table-advanced-filter-item'
import { ButtonTooltip, CustomButtonProps } from './table-actions-row'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterableColumns?: DataTableFilterableColumn<TData>[]
  searchableColumns?: DataTableSearchableColumn<TData>[]
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
  isShowAdvancedFilter?: boolean
}

export function DataTableMobileToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  addItemPagePath,
  isShowExportButtons = {
    isShow: true,
    ignoredCols: [],
    fileName: '',
  },
  customButtons,
  isShowAdvancedFilter = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [isGoPath, setGoPath] = React.useState(false)
  const t = useTableTranslations()
  const config = useTableConfig()
  const router = config.router
  const [date, setDate] = React.useState<Date>()
  const isArabic = config.i18n.direction === 'rtl' || (config.i18n.direction === 'auto' && config.i18n.locale === 'ar')

  const [selectedOptions, setSelectedOptions] = React.useState<DataTableFilterOption<TData>[]>([])

  const advancedFilterOptions: DataTableFilterOption<TData>[] = React.useMemo(() => {
    if (!isShowAdvancedFilter) return []
    const searchableOpts = searchableColumns.map((column) => ({
      id: crypto.randomUUID(),
      label: column.title ?? String(column.id),
      value: column.id,
      items: [],
    }))
    const filterableOpts = filterableColumns.map((column) => ({
      id: crypto.randomUUID(),
      label: column.title,
      value: column.id,
      items: column.options,
    }))
    return [...searchableOpts, ...filterableOpts]
  }, [isShowAdvancedFilter, filterableColumns, searchableColumns])

  const goAddItemPage = () => {
    setGoPath(true)
    if (addItemPagePath && router) {
      router.push(addItemPagePath.url)
    }
  }
  const handleExportSelectedRowsCSV = () => {
    exportSelectedRowsCsv(table, {
      fileName: isShowExportButtons.fileName,
      ignoredCols: isShowExportButtons.ignoredCols,
    })
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size={'sm'} className="h-8 px-2">
          {isFiltered ? (
            <span className="bg-main me-2 inline-flex size-3 rounded-full" />
          ) : (
            <Filter className="me-2 size-4" aria-hidden="true" />
          )}
          {t('Filter')}
        </Button>
      </DrawerTrigger>
      {isShowExportButtons.isShow && (
        <Button
          disabled={!table.getSelectedRowModel().rows.length}
          aria-label={t('export-csv')}
          title={t('export-csv')}
          variant="outline"
          className="h-8 px-2 text-sm"
          onClick={handleExportSelectedRowsCSV}
        >
          <Sheet className="me-2 size-4" aria-hidden="true" />
          {t('export-csv')}
        </Button>
      )}
      {addItemPagePath ? (
        addItemPagePath?.url ? (
          <Button
            onClick={goAddItemPage}
            size="sm"
            className="flex h-8 flex-row gap-3 px-2 text-sm"
            disabled={isGoPath}
          >
            {isGoPath ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            {addItemPagePath.text ? addItemPagePath.text : t('add')}
          </Button>
        ) : null
      ) : null}
      <DrawerContent>
        <div className="mx-auto size-full max-w-sm text-sm">
          <DrawerHeader>
            <DrawerTitle>{t('Filter')}</DrawerTitle>
            <DrawerDescription>{t('data-table-filter')}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0 text-sm">
            <div className="mt-3">
              <div className="flex w-full flex-col gap-4">
                <div className="flex flex-col items-end gap-2">
                  {searchableColumns.length > 0 &&
                    searchableColumns.map(
                      (column) =>
                        table.getColumn(column.id ? String(column.id) : '') && (
                          <div className="w-full space-y-2" key={String(column.id)}>
                            {column?.type === 'checkbox' ? (
                              <div className="mb-2 flex justify-between gap-2">
                                <Label className="cursor-pointer" htmlFor={String(column.id)}>
                                  {column.title}
                                </Label>
                                <Checkbox
                                  id={String(column.id)}
                                  checked={
                                    table.getColumn(String(column.id))?.getFilterValue() ===
                                    'true'
                                  }
                                  onCheckedChange={(value) =>
                                    table
                                      .getColumn(String(column.id))
                                      ?.setFilterValue(value ? 'true' : 'false')
                                  }
                                  aria-label={`Filter ${column.title}`}
                                  className="size-4"
                                />
                              </div>
                            ) : column?.type === 'date' ? (
                              <div className="flex flex-col items-start gap-2">
                                <Label htmlFor={String(column.id)}>{column.title}</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full justify-start text-start font-normal',
                                        !date && 'text-muted-foreground'
                                      )}
                                    >
                                      <CalendarIcon className="mx-2 size-4" />
                                      {date
                                        ? (() => {
                                            const filterValue = table
                                              .getColumn(String(column.id))
                                              ?.getFilterValue()
                                            const parsedDate =
                                              filterValue &&
                                              !isNaN(new Date(filterValue as string).getTime())
                                                ? new Date(filterValue as string)
                                                : null

                                            return parsedDate
                                              ? format(parsedDate, 'PPP', {
                                                  locale: isArabic ? ar : enUS,
                                                })
                                              : `${t('Filter')} ${column.title}...`
                                          })()
                                        : `${t('Filter')} ${column.title}...`}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      className="py-2 text-sm"
                                      mode="single"
                                      selected={
                                        table.getColumn(String(column.id))?.getFilterValue()
                                          ? new Date(
                                              table
                                                .getColumn(String(column.id))
                                                ?.getFilterValue() as string
                                            )
                                          : undefined
                                      }
                                      onSelect={(selectedDate) => {
                                        if (selectedDate && !isNaN(selectedDate.getTime())) {
                                          table
                                            .getColumn(String(column.id))
                                            ?.setFilterValue(format(selectedDate, 'yyyy-MM-dd'))
                                          setDate(selectedDate)
                                        }
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            ) : (
                              <>
                                <Label htmlFor={String(column.id)}>{column.title}</Label>
                                <Input
                                  id={String(column.id)}
                                  type={column?.type || 'text'}
                                  key={String(column.id)}
                                  placeholder={`${t('Filter')} ${column.title}...`}
                                  value={
                                    (table
                                      .getColumn(String(column.id))
                                      ?.getFilterValue() as string) ?? ''
                                  }
                                  onChange={(event) =>
                                    table
                                      .getColumn(String(column.id))
                                      ?.setFilterValue(event.target.value)
                                  }
                                  className="h-8 w-full py-0"
                                />
                              </>
                            )}
                          </div>
                        )
                    )}
                  <Separator className="bg-main-300 my-2 h-px w-full" />
                  {isShowAdvancedFilter ? (
                    <div className="flex w-full flex-col gap-4">
                      <Drawer direction="right">
                        <DrawerTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 w-full justify-start gap-1.5">
                            <ListFilter className="size-4" />
                            {t('add-filter')}
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent direction="right">
                          <DrawerHeader className="text-start">
                            <DrawerTitle>{t('advanced-filter')}</DrawerTitle>
                          </DrawerHeader>
                          <div className="flex flex-col gap-1 overflow-y-auto p-4">
                            {advancedFilterOptions.map((option) => {
                              const isSelected = selectedOptions.some(
                                (sel) => sel.value === option.value && !sel.isMulti
                              )
                              return (
                                <DrawerClose asChild key={String(option.value)}>
                                  <Button
                                    variant={isSelected ? 'outline' : 'ghost'}
                                    size="sm"
                                    className="w-full justify-start gap-2 capitalize"
                                    onClick={() => {
                                      setSelectedOptions((prev) => {
                                        if (isSelected) {
                                          return prev.filter(
                                            (item) => item.value !== option.value || item.isMulti
                                          )
                                        }
                                        return [...prev, option]
                                      })
                                    }}
                                  >
                                    {option.items.length > 0 ? (
                                      <Rows3 className="size-4 text-muted-foreground" />
                                    ) : (
                                      <Type className="size-4 text-muted-foreground" />
                                    )}
                                    <span className="flex-1 text-start">{option.label}</span>
                                    {isSelected && <Check className="size-4 text-primary" />}
                                  </Button>
                                </DrawerClose>
                              )
                            })}
                          </div>
                        </DrawerContent>
                      </Drawer>
                      {selectedOptions.filter((opt) => !opt.isMulti).map((selectedOption) => (
                        <DataTableAdvancedFilterItem
                          key={String(selectedOption.value)}
                          table={table}
                          selectedOption={selectedOption}
                          setSelectedOptions={setSelectedOptions}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex w-full flex-col gap-4">
                      {filterableColumns.length > 0 &&
                        filterableColumns.map(
                          (column) =>
                            table.getColumn(column.id ? String(column.id) : '') && (
                              <DataTableFacetedFilter
                                className="justify-start"
                                key={String(column.id)}
                                column={table.getColumn(column.id ? String(column.id) : '')}
                                title={column.title}
                                options={column.options}
                              />
                            )
                        )}
                    </div>
                  )}
                  <Separator className="bg-main-300 my-2 h-px w-full" />
                </div>
                <div className="grid gap-4">
                  <DataTableViewOptions table={table} />
                  {customButtons && Array.isArray(customButtons)
                    ? customButtons
                        .filter((customButton) => Object.keys(customButton).length !== 0)
                        .map((customButton, index) => (
                          <Button
                            key={index}
                            onClick={customButton.function}
                            variant={'outline'}
                            className={`${customButton.className ? customButton.className : ''} relative flex justify-center gap-2 text-nowrap text-sm`}
                            {...customButton.attr}
                          >
                            {customButton.toolTip && (
                              <ButtonTooltip content={customButton.toolTip}></ButtonTooltip>
                            )}
                            {customButton.text}
                            {customButton.icon}
                            {customButton.children}
                          </Button>
                        ))
                    : React.isValidElement(customButtons)
                      ? customButtons
                      : null}
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter className="grid grid-cols-2">
            <Separator className="bg-main-300 col-span-2 my-2 h-px" />
            <DrawerClose asChild>
              <Button disabled={!isFiltered}>{t('Apply')}</Button>
            </DrawerClose>
            <Button
              aria-label="Reset filters"
              variant="outline"
              disabled={!isFiltered}
              onClick={() => table.resetColumnFilters()}
            >
              {t('Reset')}
              <X className="ms-2 size-4" aria-hidden="true" />
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
