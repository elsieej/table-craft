import type { ColumnDef } from '@tanstack/react-table'
import { useCallback, useEffect, useState } from 'react'
import { ClientSideTable, FilterOptions } from 'react-table-craft'
import { fetchUsers } from '../apis/user.api'
import type { User } from '../types/user.type'

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    filterFn: 'arrIncludesSome',
  },
]

const FILTERABLE_QUERY = [
  {
    id: 'role' as const,
    title: 'Role',
    options: [
      { label: 'Admin', value: 'Admin' },
      { label: 'Editor', value: 'Editor' },
      { label: 'Viewer', value: 'Viewer' },
    ],
    isSingleSelect: true,
  },
  {
    id: 'permissions' as const,
    title: 'Permissions',
    options: [
      { label: 'Read', value: 'read' },
      { label: 'Write', value: 'write' },
      { label: 'Delete', value: 'delete' },
    ],
    isSingleSelect: false,
  },
]

export default function UsersQueryLocalStatePage() {
  const [data, setData] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Local state thay vì URL
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [name, setName] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    fetchUsers({
      page,
      perPage,
      search: name || undefined,
      role: filters.role as string | undefined,
      permissions: filters.permissions
        ? String(filters.permissions).split('.').filter(Boolean)
        : undefined,
    })
      .then((res) => {
        if (!cancelled) {
          setData(res.data)
          setTotal(res.meta.total)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData([])
          setTotal(0)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [page, perPage, name, filters.role, filters.permissions])

  const handleFilterChange = useCallback(
    (key: keyof FilterOptions, value: string | number | undefined) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value !== undefined && value !== '' ? String(value) : undefined,
      }))
      setPage(1)
    },
    []
  )

  const onClearFilters = useCallback(() => {
    setFilters({})
    setName('')
    setPage(1)
  }, [])

  const paginationData = {
    paginationResponse: {
      meta: {
        current_page: page,
        last_page: Math.ceil(total / perPage) || 1,
        per_page: perPage,
        total,
      },
    },
    onPageChange: (newPage: number) => setPage(newPage),
    onPageSizeChange: (newSize: number) => {
      setPerPage(newSize)
      setPage(1)
    },
  }

  const searchableQuery = [
    {
      id: 'name' as const,
      title: 'Name',
      defaultSearch: name,
      handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value.trim())
        setPage(1)
      },
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">
          Query mode (local state, no URL sync)
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Fetch từ API, state lưu trong React. Refresh sẽ reset.
        </p>
        <ClientSideTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          isQueryPagination={true}
          paginationData={paginationData}
          isQuerySearch={true}
          searchableQuery={searchableQuery}
          isQueryFilter={true}
          filterableQuery={FILTERABLE_QUERY}
          handleFilterChange={handleFilterChange}
          currentFilters={filters}
          onClearFilters={onClearFilters}
        />
      </div>
    </div>
  )
}
