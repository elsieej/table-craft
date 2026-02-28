export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from?: number
  to?: number
}

export interface PaginationLinks {
  first?: string
  last?: string
  prev?: string | null
  next?: string | null
}

export interface Pagination {
  meta: PaginationMeta
  links?: PaginationLinks
}

export interface BackendPagination {
  meta: PaginationMeta
  links?: PaginationLinks
}

export interface CursorPaginationInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string | null
  endCursor?: string | null
  totalCount?: number
}

export interface CursorPaginationData {
  pageInfo: CursorPaginationInfo
  onNextPage: () => void
  onPreviousPage: () => void
  onPageSizeChange: (size: number) => void
  pageSize?: number
}
