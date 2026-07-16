import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ClientSideTable } from '../components/client-side-table'
import type { Pagination } from '../types/pagination'

interface Row {
  id: string
  name: string
}

const PAGE_SIZE = 10
const allData: Row[] = Array.from({ length: 25 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Row ${i + 1}`,
}))
const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]

function paginationFor(page: number): Pagination {
  return {
    meta: {
      current_page: page,
      last_page: Math.ceil(allData.length / PAGE_SIZE),
      per_page: PAGE_SIZE,
      total: allData.length,
    },
  }
}

function pageSlice(page: number) {
  return allData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
}

// Mimics a consumer that owns page state itself and fetches/slices data
// per page — the common "isQueryPagination + paginationData" shape, with
// no router wired up.
function QueryPaginatedTable() {
  const [page, setPage] = React.useState(1)
  return (
    <ClientSideTable
      columns={columns}
      data={pageSlice(page)}
      isQueryPagination
      paginationData={{
        paginationResponse: paginationFor(page),
        onPageChange: setPage,
        onPageSizeChange: () => {},
      }}
    />
  )
}

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

describe('ClientSideTable withIndex row numbering with server-driven (isQueryPagination) pagination', () => {
  it('numbers page 1 rows 1-10', () => {
    const { container } = render(<QueryPaginatedTable />)
    expect(indexColumnValues(container)).toEqual(
      Array.from({ length: 10 }, (_, i) => `${i + 1}`)
    )
  })

  it('numbers page 2 rows 11-20, not 1-10', () => {
    const { container } = render(<QueryPaginatedTable />)
    clickNext(container)
    expect(indexColumnValues(container)).toEqual(
      Array.from({ length: 10 }, (_, i) => `${i + 11}`)
    )
  })

  it('numbers page 3 rows 21-25', () => {
    const { container } = render(<QueryPaginatedTable />)
    clickNext(container)
    clickNext(container)
    expect(indexColumnValues(container)).toEqual(
      Array.from({ length: 5 }, (_, i) => `${i + 21}`)
    )
  })
})
