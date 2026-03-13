import type { ColumnDef } from '@tanstack/react-table'
import { ChangeEvent, useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import {
  ClientSideTable,
  DataTableColumnHeader,
  DataTableQuerySearchable,
  FilterOptions
} from 'react-table-craft'
import { useUsersApi } from '../hooks/use-users-api'
import type { User } from '../types/user.type'
import { Checkbox } from 'react-table-craft'

const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
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

const UsersWithParamsSearchPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data, total, isLoading, page, perPage } = useUsersApi()

  const currentFilters = useMemo<FilterOptions>(
    () => ({
      role: searchParams.get('role') ?? undefined,
      permissions: searchParams.get('permissions') ?? undefined,
    }),
    [searchParams]
  )

  const router = useMemo(
    () => ({
      getSearchParams: () => searchParams,
      getPathname: () => location.pathname,
      push: (url: string) => navigate(url),
      replace: (url: string) => navigate(url, { replace: true }),
    }),
    [searchParams, navigate, location]
  )

  const tableConfig = useMemo(
    () => ({
      router,
      features: {
        csvExport: true,
        search: true,
        filter: true,
        pagination: true,
      },
    }),
    [router]
  )

  const paginationData = useMemo(
    () => ({
      paginationResponse: {
        meta: {
          current_page: page,
          last_page: Math.ceil(total / perPage) || 1,
          per_page: perPage,
          total,
        },
      },
      onPageChange: (newPage: number) => {
        const next = new URLSearchParams(searchParams)
        next.set('page', String(newPage))
        navigate(`?${next.toString()}`)
      },
      onPageSizeChange: () => {},
    }),
    [page, total, perPage, searchParams, navigate]
  )

  const filterableQuery = useMemo(
    () => [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'role', title: 'Role' },
    ],
    [columns]
  )
  const searchableQuery = useMemo(
    () => [
      {
        id: 'name' as const,
        title: 'Name',
        defaultSearch: searchParams.get('name') || '',
        handleInputChange: (event: ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value.trim()
          const next = new URLSearchParams(searchParams)
          if (value) {
            next.set('name', value)
          } else {
            next.delete('name')
          }
          next.set('page', '1')
          navigate(`?${next.toString()}`, { replace: true })
        },
      },
    ],
    [searchParams, navigate]
  )

  const handleFilterChange = useCallback(
    (key: keyof FilterOptions, value: string | number | undefined) => {
      const next = new URLSearchParams(searchParams)
      if (value !== undefined && value !== '') {
        next.set(key.toString(), String(value))
      } else {
        next.delete(key.toString())
      }
      next.set('page', '1')
      navigate(`?${next.toString()}`, { replace: true })
    },
    [searchParams, navigate]
  )

  const onClearFilters = useCallback(() => {
    const next = new URLSearchParams(searchParams)
    next.delete('role')
    next.delete('permissions')
    next.set('page', '1')
    navigate(`?${next.toString()}`, { replace: true })
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">
          Query with URL params search
        </h1>
        <ClientSideTable
          config={tableConfig}
          columns={columns}
          data={data}
          isLoading={isLoading}
          isQueryPagination={true}
          paginationData={paginationData}
          isQuerySearch={true}
          searchableQuery={searchableQuery as DataTableQuerySearchable<User>[]}
          isQueryFilter={true}
          filterableQuery={FILTERABLE_QUERY}
          handleFilterChange={handleFilterChange}
          currentFilters={currentFilters}
          onClearFilters={onClearFilters}
        />
      </div>
    </div>
  )
}

export default UsersWithParamsSearchPage
