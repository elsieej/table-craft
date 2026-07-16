import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../components/data-table'
import type { DataTableFilterableColumn, DataTableQuerySearchable } from '../types/table'

interface Row {
  id: string
  name: string
}

const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]
const data: Row[] = [{ id: '1', name: 'Row One' }]

function allDivs(container: HTMLElement) {
  return Array.from(container.querySelectorAll('div'))
}

// jsdom has no CSS engine, so `max-lg:hidden`/`lg:hidden` hide nothing — both
// toolbars are simultaneously present. Every lookup below is anchored to a
// distinguishing className token and read as a plain string, rather than via a
// CSS selector, to avoid ambiguous/duplicate matches and selector-escaping
// pitfalls with classes containing `[`, `]`, or `:` (e.g. `min-w-[200px]`).

describe('DataTable responsive toolbar (RFC 0002)', () => {
  it('renders the desktop toolbar wrapper with max-lg:hidden', () => {
    const { container } = render(<DataTable columns={columns} data={data} />)
    const desktopWrapper = allDivs(container).find((d) => d.className.includes('max-lg:hidden'))
    expect(desktopWrapper).toBeTruthy()
  })

  it('renders the mobile toolbar wrapper with lg:hidden, not max-lg:hidden', () => {
    const { container } = render(<DataTable columns={columns} data={data} />)
    const mobileWrapper = allDivs(container).find(
      (d) => d.className.includes('lg:hidden') && !d.className.includes('max-lg:hidden')
    )
    expect(mobileWrapper).toBeTruthy()
  })

  it('gives the desktop search wrapper basis-full and xl:basis-auto', () => {
    const { container } = render(<DataTable columns={columns} data={data} />)
    const searchWrapper = allDivs(container).find((d) => d.className.includes('min-w-[200px]'))
    expect(searchWrapper).toBeTruthy()
    expect(searchWrapper!.className).toContain('basis-full')
    expect(searchWrapper!.className).toContain('xl:basis-auto')
  })

  it('gives the desktop actions wrapper basis-full and xl:basis-auto', () => {
    const { container } = render(<DataTable columns={columns} data={data} />)
    const actionsWrapper = allDivs(container).find(
      (d) => d.className.includes('flex-wrap') && d.className.includes('basis-full')
    )
    expect(actionsWrapper).toBeTruthy()
    expect(actionsWrapper!.className).toContain('xl:basis-auto')
  })

  it('renders the query-search input inline in the mobile toolbar row, outside the drawer', () => {
    const searchableQuery: DataTableQuerySearchable<Row>[] = [
      { id: 'name', title: 'Name', handleInputChange: vi.fn() },
    ]
    const filterableColumns: DataTableFilterableColumn<Row>[] = [
      { id: 'name', title: 'Name', options: [{ label: 'Row One', value: '1' }] },
    ]

    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        isQuerySearch
        searchableQuery={searchableQuery}
        filterableColumns={filterableColumns}
      />
    )

    const mobileWrapper = allDivs(container).find(
      (d) => d.className.includes('lg:hidden') && !d.className.includes('max-lg:hidden')
    )
    expect(mobileWrapper).toBeTruthy()

    // Present in the toolbar row markup without ever clicking the drawer trigger.
    // Note: querying by `#name` is unreliable here because both toolbars render an
    // input with the same id (jsdom doesn't evaluate the lg:hidden CSS that would
    // normally hide one of them) — an attribute selector avoids that id collision.
    const input = mobileWrapper!.querySelector('input[placeholder="Filter Name..."]')
    expect(input).toBeTruthy()
  })
})
