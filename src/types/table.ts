import type { ComponentType } from 'react'

/** Result of serializing filter values for URL — single key (e.g. ?key=a.b.c) or multi-key (e.g. ?key=a&key=b). */
export interface SerializedSingleKey {
  type: 'single'
  value: string
}

/** Result of serializing filter values for URL — multi-key format. */
export interface SerializedMultiKey {
  type: 'multi'
  values: string[]
}

export type SerializedResult = SerializedSingleKey | SerializedMultiKey

/** Parses URL param(s) into string[] and serializes string[] back to URL format. */
export interface FilterSerializer {
  parse(rawValue: string | null, allValues: string[]): string[]
  serialize(values: string[]): SerializedResult
}

/** A selectable option used in filter dropdowns. */
export interface Option {
  label: string
  value: string
  icon?: ComponentType<{ className?: string }>
}

/** Configuration for a text-searchable column (client-side filtering). */
export interface DataTableSearchableColumn<TData> {
  id: keyof TData
  title: string
  type?: 'text' | 'number' | 'checkbox' | 'date'
}

/** Configuration for a server-side searchable column with a custom input handler. */
export interface DataTableQuerySearchable<TData> {
  id: keyof TData
  title: string
  type?: 'text' | 'number'
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  defaultSearch?: string
}

/** Configuration for a filterable column with predefined selectable options. */
export interface DataTableFilterableColumn<TData> {
  id: keyof TData
  title: string
  options: Option[]
  /** When true, only one option can be selected at a time (radio behavior). */
  isSingleSelect?: boolean
  /** Override URL serialization format for this column. Falls back to config.filter.defaultSerializer. */
  serializer?: FilterSerializer
}

/** Configuration for an advanced filter option (used in the filter builder UI). */
export interface DataTableFilterOption<TData> {
  id: string
  label: string
  value: keyof TData | string
  items: Option[]
  /** When true, this filter is part of a multi-condition group. */
  isMulti?: boolean
}
