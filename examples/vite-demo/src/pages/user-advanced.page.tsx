import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ClientSideTable } from 'react-table-craft'
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from 'react-table-craft'
import type { User } from '../types/user.type'
import {
  advancedSelectFilterFn,
  advancedTextFilterFn,
  checkboxFilterFn,
  dateFilterFn,
} from '../libs/filter-fns'
import { useUsersApi } from '../hooks/use-users-api'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    filterFn: advancedTextFilterFn as FilterFn<User>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    filterFn: advancedTextFilterFn as FilterFn<User>,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    filterFn: advancedSelectFilterFn as FilterFn<User>,
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    filterFn: advancedSelectFilterFn as FilterFn<User>,
  },
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: ({ getValue }) => (getValue() ? 'Yes' : 'No'),
    filterFn: checkboxFilterFn as FilterFn<User>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    filterFn: dateFilterFn as FilterFn<User>,
  },
]

const SEARCHABLE_COLUMNS: DataTableSearchableColumn<User>[] = [
  { id: 'name', title: 'Name' },
  { id: 'isActive', title: 'Active', type: 'checkbox' },
  { id: 'createdAt', title: 'Created', type: 'date' },
]

const FILTERABLE_COLUMNS: DataTableFilterableColumn<User>[] = [
  {
    id: 'role',
    title: 'Role',
    options: [
      { label: 'Admin', value: 'Admin' },
      { label: 'Editor', value: 'Editor' },
      { label: 'Viewer', value: 'Viewer' },
    ],
    isSingleSelect: true,
  },
  {
    id: 'permissions',
    title: 'Permissions',
    options: [
      { label: 'Read', value: 'read' },
      { label: 'Write', value: 'write' },
      { label: 'Delete', value: 'delete' },
    ],
  },
]

export default function UsersAdvancedPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data, total, isLoading, page, perPage } = useUsersApi()

  const searchParamsStable = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )

  const router = useMemo(
    () => ({
      getSearchParams: () => searchParamsStable,
      getPathname: () => location.pathname,
      push: (url: string) => navigate(url),
      replace: (url: string) => navigate(url, { replace: true }),
    }),
    [navigate, location, searchParamsStable]
  )

  const tableConfig = useMemo(
    () => ({
      router,
      features: {
        csvExport: false,
        search: true,
        filter: true,
        pagination: true,
        advancedFilter: true,
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
      onPageSizeChange: (newSize: number) => {
        const next = new URLSearchParams(searchParams)
        next.set('per_page', String(newSize))
        next.set('page', '1')
        navigate(`?${next.toString()}`)
      },
    }),
    [page, total, perPage, searchParams, navigate]
  )

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold text-slate-800">
            Users (Advanced Toolbar)
          </h1>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Client-side filter với Advanced Toolbar. Pagination sync URL.
        </p>
        <ClientSideTable
          config={tableConfig}
          columns={columns}
          data={data}
          isLoading={isLoading}
          searchableColumns={SEARCHABLE_COLUMNS}
          filterableColumns={FILTERABLE_COLUMNS}
          isShowAdvancedFilter={true}
          isQueryPagination={true}
          paginationData={paginationData}
        />
      </div>
    </div>
  )
}
