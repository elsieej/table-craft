import type { FilterFn } from '@tanstack/react-table'

export const advancedTextFilterFn: FilterFn<unknown> = (row, columnId, filterValue) => {
  const parsed = filterValue as { value?: string; operator?: string } | undefined
  if (!parsed?.value) return true
  const cellValue = String(row.getValue(columnId) ?? '').toLowerCase()
  const q = parsed.value.toLowerCase()
  const op = parsed.operator ?? 'contains'
  switch (op) {
    case 'contains': return cellValue.includes(q)
    case 'does not contain': return !cellValue.includes(q)
    case 'is': return cellValue === q
    case 'is not': return cellValue !== q
    default: return cellValue.includes(q)
  }
}

export const advancedSelectFilterFn: FilterFn<unknown> = (row, columnId, filterValue) => {
  const parsed = filterValue as { value?: string[]; operator?: string } | undefined
  if (!parsed?.value?.length) return true
  const cellVal = row.getValue(columnId)
  const cellValues = Array.isArray(cellVal) ? cellVal : [cellVal]
  const hasMatch = parsed.value.some((v) => cellValues.includes(v))
  const op = parsed.operator ?? 'is'
  return op === 'is' ? hasMatch : !hasMatch
}

export const checkboxFilterFn: FilterFn<unknown> = (row, columnId, filterValue) => {
    if (!filterValue) return true
    const cellVal = row.getValue(columnId)
    const cellStr = cellVal === true || cellVal === 'true' ? 'true' : 'false'
    return cellStr === filterValue
  }

  export const dateFilterFn: FilterFn<unknown> = (row, columnId, filterValue) => {
    if (!filterValue) return true
    const cellVal = row.getValue(columnId)
    const cellStr = cellVal ? String(cellVal).slice(0, 10) : ''
    return cellStr === filterValue
  }
