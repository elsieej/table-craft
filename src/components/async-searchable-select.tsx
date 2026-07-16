'use client'

import * as React from 'react'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useTableTranslations } from '../hooks/use-table-translations'
import { useTableConfig } from '../config'
import { useDebounce } from '../hooks/use-debounce'
import { Button } from './ui/button'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import type { AsyncOptionsFetcher, Option } from '../types/table'

export interface AsyncSearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  fetchOptions: AsyncOptionsFetcher
  /**
   * Label shown on the trigger when `value` isn't among the currently loaded
   * options (e.g. selected before searching, or on an unloaded page). This
   * component has no cache layer to resolve that label itself.
   */
  selectedLabel?: string
  placeholder?: string
  searchPlaceholder?: string
  allLabel?: string
  emptyText?: string
  loadingText?: string
  loadingMoreText?: string
  errorText?: string
  className?: string
  disabled?: boolean
  /** URL param key to sync search text to via the configured router adapter. Omit to disable URL sync. */
  paramKey?: string
  /** Debounce (ms) applied to both refetching and writing the URL. Defaults to config.search.debounceMs. */
  debounceMs?: number
  /** Number of options requested per page. */
  pageSize?: number
  /**
   * Overrides how the trigger renders the current selection (e.g. an avatar + name, a badge).
   * Receives the matched `Option` from currently loaded results — `undefined` if `value` isn't
   * among them — and the raw `value`. Only called when `value` is non-empty; falls back to the
   * default label rendering (`selectedLabel` prop → matched option's label → raw `value`) when
   * omitted.
   */
  renderSelected?: (option: Option | undefined, value: string) => React.ReactNode
}

export function AsyncSearchableSelect({
  value,
  onValueChange,
  fetchOptions,
  selectedLabel: selectedLabelProp,
  placeholder,
  searchPlaceholder,
  allLabel,
  emptyText,
  loadingText,
  loadingMoreText,
  errorText,
  className,
  disabled,
  paramKey,
  debounceMs,
  pageSize = 20,
  renderSelected,
}: AsyncSearchableSelectProps) {
  const t = useTableTranslations()
  const router = useTableConfig((config) => config.router)
  const configDebounceMs = useTableConfig((config) => config.search.debounceMs)
  const resolvedDebounceMs = debounceMs ?? configDebounceMs

  const [open, setOpen] = React.useState(false)
  const [searchInput, setSearchInput] = React.useState(() => {
    if (!paramKey || !router) return ''
    return router.getSearchParams().get(paramKey) ?? ''
  })
  const debouncedSearch = useDebounce(searchInput, resolvedDebounceMs)

  const [options, setOptions] = React.useState<Option[]>([])
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const genRef = React.useRef(0)
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const [sentinelNode, setSentinelNode] = React.useState<HTMLDivElement | null>(null)

  // Fetch page 1 whenever the popover opens or the debounced search text changes while open.
  React.useEffect(() => {
    if (!open) return

    const gen = ++genRef.current
    setIsLoading(true)
    setError(null)

    fetchOptions({ search: debouncedSearch, page: 1, pageSize })
      .then((result) => {
        if (gen !== genRef.current) return
        setOptions(result.options)
        setHasMore(result.hasMore)
        setPage(1)
      })
      .catch(() => {
        if (gen !== genRef.current) return
        setError(errorText ?? t('load-error'))
      })
      .finally(() => {
        if (gen !== genRef.current) return
        setIsLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedSearch])

  const loadMore = React.useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return

    const gen = genRef.current
    const nextPage = page + 1
    setIsLoadingMore(true)

    fetchOptions({ search: debouncedSearch, page: nextPage, pageSize })
      .then((result) => {
        if (gen !== genRef.current) return
        setOptions((prev) => [...prev, ...result.options])
        setHasMore(result.hasMore)
        setPage(nextPage)
      })
      .catch(() => {
        if (gen !== genRef.current) return
        setError(errorText ?? t('load-error'))
      })
      .finally(() => {
        if (gen !== genRef.current) return
        setIsLoadingMore(false)
      })
  }, [isLoading, isLoadingMore, hasMore, page, debouncedSearch, fetchOptions, pageSize, errorText, t])

  // Runs after every commit, once all refs (including CommandList's) are guaranteed attached —
  // avoids relying on the sentinel's (child) ref firing before CommandList's (parent) ref, which
  // isn't guaranteed on the same commit.
  React.useEffect(() => {
    if (!sentinelNode || !listRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root: listRef.current, rootMargin: '80px 0px', threshold: 0 }
    )
    observer.observe(sentinelNode)
    return () => observer.disconnect()
  }, [sentinelNode, loadMore])

  // Debounced write of the search text to the URL, skipped when there's no router/paramKey or no change.
  React.useEffect(() => {
    if (!router || !paramKey) return

    const current = router.getSearchParams()
    if ((current.get(paramKey) ?? '') === debouncedSearch) return

    const next = new URLSearchParams(current.toString())
    if (debouncedSearch) {
      next.set(paramKey, debouncedSearch)
    } else {
      next.delete(paramKey)
    }
    const qs = next.toString()
    const url = `${router.getPathname()}${qs ? `?${qs}` : ''}`
    const navigate = router.replace ?? router.push
    navigate(url)
  }, [debouncedSearch, paramKey, router])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      genRef.current += 1
      setOptions([])
      setPage(1)
      setHasMore(true)
      setError(null)
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleSelect = (selected: string) => {
    onValueChange(selected === value ? '' : selected)
    setOpen(false)
  }

  const selectedOption = value ? options.find((o) => o.value === value) : undefined
  const selectedLabel = value ? (selectedOption?.label ?? selectedLabelProp ?? value) : undefined

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('h-8 justify-between gap-1.5 font-normal', className)}
        >
          {value && renderSelected ? (
            renderSelected(selectedOption, value)
          ) : (
            <span className={cn('truncate text-sm', value ? 'text-foreground' : 'text-muted-foreground')}>
              {selectedLabel ?? placeholder ?? allLabel ?? t('all')}
            </span>
          )}
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={searchInput}
            onValueChange={setSearchInput}
            placeholder={searchPlaceholder ?? `${t('search')}...`}
          />
          <CommandList ref={listRef}>
            <CommandGroup>
              <CommandItem
                value="__all__"
                onSelect={() => { onValueChange(''); setOpen(false) }}
              >
                {allLabel ?? t('all')}
                <Check className={cn('ms-auto size-4', !value ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>

              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {loadingText ?? t('loading')}
                </div>
              )}

              {!isLoading && error && (
                <div className="py-6 text-center text-sm text-destructive">{error}</div>
              )}

              {!isLoading && !error && options.length === 0 && (
                <div className="py-6 text-center text-sm">{emptyText ?? t('no-items-found')}</div>
              )}

              {!isLoading &&
                options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    {option.icon && (
                      <option.icon className="me-2 size-4 text-muted-foreground" aria-hidden />
                    )}
                    <span className="truncate">{option.label}</span>
                    {option.description && (
                      <span className="ms-1.5 shrink-0 font-mono text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                    <Check
                      className={cn('ms-auto size-4 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')}
                    />
                  </CommandItem>
                ))}

              {hasMore && !isLoading && !error && (
                <div ref={setSentinelNode} className="h-px" aria-hidden />
              )}

              {isLoadingMore && (
                <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  {loadingMoreText ?? t('loading-more')}
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
