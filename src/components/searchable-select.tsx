'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
}: SearchableSelectProps) {
  const t = useTableTranslations()
  const [open, setOpen] = React.useState(false)

  const selectedLabel = options.find((o) => o.value === value)?.label

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
          <span className={cn('truncate text-sm', value ? 'text-foreground' : 'text-muted-foreground')}>
            {selectedLabel ?? placeholder ?? allLabel ?? t('all')}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
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
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  {option.icon && (
                    <option.icon className="me-2 size-4 text-muted-foreground" aria-hidden />
                  )}
                  {option.label}
                  <Check
                    className={cn('ms-auto size-4', value === option.value ? 'opacity-100' : 'opacity-0')}
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
