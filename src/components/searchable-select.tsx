'use client'

import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils'
import { useTableTranslations } from '../hooks/use-table-translations'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import type { Option } from '../types/table'

export interface SearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: Option[]
  placeholder?: string
  searchPlaceholder?: string
  allLabel?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  /**
   * Overrides how the trigger renders the current selection (e.g. an avatar + name, a badge).
   * Receives the matched `Option` (or `undefined` if `value` isn't among `options`) and the raw
   * `value`. Only called when `value` is non-empty; falls back to the default label rendering
   * when omitted.
   */
  renderSelected?: (option: Option | undefined, value: string) => React.ReactNode
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  allLabel,
  emptyText,
  className,
  disabled,
  renderSelected,
}: SearchableSelectProps) {
  const t = useTableTranslations()
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((o) => o.value === value)
  const selectedLabel = selectedOption?.label

  const handleSelect = (selected: string) => {
    onValueChange(selected === value ? '' : selected)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? `${t('search')}...`} />
          <CommandList>
            <CommandEmpty>{emptyText ?? t('no-items-found')}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={allLabel ?? t('all')}
                onSelect={() => { onValueChange(''); setOpen(false) }}
              >
                {allLabel ?? t('all')}
                <Check className={cn('ms-auto size-4', !value ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.description ? `${option.label} ${option.description}` : option.label}
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
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
