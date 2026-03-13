import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { fetchUsers } from '../apis/user.api'
import type { User } from '../types/user.type'

const DEFAULT_PER_PAGE = 10

export function useUsersApi() {
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('per_page') || DEFAULT_PER_PAGE) || DEFAULT_PER_PAGE
  const role = searchParams.get('role') ?? undefined
  const permissionsParam = searchParams.get('permissions')
  const permissions = permissionsParam
    ? permissionsParam.split('.').filter(Boolean)
    : undefined
  const name = searchParams.get('name') ?? undefined

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    fetchUsers({
      page,
      perPage,
      search: name,
      role,
      permissions,
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

    return () => {
      cancelled = true
    }
  }, [page, perPage, role, permissionsParam, name])

  return {
    data,
    total,
    isLoading,
    page,
    perPage,
  }
}
