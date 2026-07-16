import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ClientSideTable } from '../components/client-side-table'

interface Row {
  id: string
  name: string
}

const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]
const data: Row[] = Array.from({ length: 25 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Row ${i + 1}`,
}))

function indexColumnValues(container: HTMLElement) {
  const rows = Array.from(container.querySelectorAll('tbody tr'))
  return rows.map((row) => row.querySelector('td')!.textContent)
}

function clickNext(container: HTMLElement) {
  const nav = container.querySelector('nav[aria-label="Pagination"]')!
  const next = Array.from(nav.querySelectorAll('button')).find((b) =>
    b.textContent?.includes('Next')
  )!
  fireEvent.click(next)
}

describe('ClientSideTable withIndex row numbering', () => {
  it('numbers page 1 rows 1-10', () => {
    const { container } = render(<ClientSideTable columns={columns} data={data} pageSize={10} pageCount={3} />)
    expect(indexColumnValues(container)).toEqual(
      Array.from({ length: 10 }, (_, i) => `${i + 1}`)
    )
  })

  it('numbers page 2 rows 11-20, not 1-10', () => {
    const { container } = render(<ClientSideTable columns={columns} data={data} pageSize={10} pageCount={3} />)
    clickNext(container)
    expect(indexColumnValues(container)).toEqual(
      Array.from({ length: 10 }, (_, i) => `${i + 11}`)
    )
  })

  it('numbers page 3 rows 21-25', () => {
    const { container } = render(<ClientSideTable columns={columns} data={data} pageSize={10} pageCount={3} />)
    clickNext(container)
    clickNext(container)
    expect(indexColumnValues(container)).toEqual(
      Array.from({ length: 5 }, (_, i) => `${i + 21}`)
    )
  })
})
