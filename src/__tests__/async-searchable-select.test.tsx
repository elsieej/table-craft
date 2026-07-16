import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import React from 'react'
import { AsyncSearchableSelect } from '../components/async-searchable-select'
import { TableProvider } from '../config/context'
import type { TableRouterAdapter } from '../types/table-config'
import type { AsyncOptionsFetchResult } from '../types/table'

function createRouter(initialUrl = '/list'): TableRouterAdapter & { push: ReturnType<typeof vi.fn>; replace: ReturnType<typeof vi.fn> } {
  let params = new URLSearchParams(initialUrl.split('?')[1] ?? '')
  const push = vi.fn((url: string) => {
    params = new URLSearchParams(url.split('?')[1] ?? '')
  })
  const replace = vi.fn((url: string) => {
    params = new URLSearchParams(url.split('?')[1] ?? '')
  })
  return {
    push,
    replace,
    getSearchParams: () => params,
    getPathname: () => '/list',
  }
}

function renderWithRouter(
  ui: React.ReactElement,
  router?: TableRouterAdapter
) {
  const wrapper = router
    ? ({ children }: { children: React.ReactNode }) => (
        <TableProvider config={{ router }}>{children}</TableProvider>
      )
    : undefined
  return render(ui, wrapper ? { wrapper } : undefined)
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

async function openPopover() {
  fireEvent.click(screen.getByRole('combobox'))
  await screen.findByPlaceholderText('Search...')
}

describe('AsyncSearchableSelect', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not fetch while closed, fetches page 1 on open', async () => {
    const fetchOptions = vi.fn().mockResolvedValue({ options: [{ label: 'A', value: 'a' }], hasMore: false })
    render(<AsyncSearchableSelect value="" onValueChange={vi.fn()} fetchOptions={fetchOptions} />)

    expect(fetchOptions).not.toHaveBeenCalled()

    await act(async () => {
      await openPopover()
    })

    expect(fetchOptions).toHaveBeenCalledTimes(1)
    expect(fetchOptions).toHaveBeenCalledWith({ search: '', page: 1, pageSize: 20 })
    await screen.findByText('A')
  })

  it('debounces rapid typing into a single refetch', async () => {
    const fetchOptions = vi.fn().mockResolvedValue({ options: [], hasMore: false })
    render(
      <AsyncSearchableSelect value="" onValueChange={vi.fn()} fetchOptions={fetchOptions} debounceMs={300} />
    )

    await act(async () => {
      await openPopover()
    })
    expect(fetchOptions).toHaveBeenCalledTimes(1)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'f' } })
    act(() => { vi.advanceTimersByTime(100) })
    fireEvent.change(input, { target: { value: 'fo' } })
    act(() => { vi.advanceTimersByTime(100) })
    fireEvent.change(input, { target: { value: 'foo' } })

    await act(async () => { vi.advanceTimersByTime(300) })

    expect(fetchOptions).toHaveBeenCalledTimes(2)
    expect(fetchOptions).toHaveBeenLastCalledWith({ search: 'foo', page: 1, pageSize: 20 })
  })

  it('loads the next page and appends results when the sentinel intersects', async () => {
    const fetchOptions = vi
      .fn()
      .mockResolvedValueOnce({ options: [{ label: 'A', value: 'a' }], hasMore: true })
      .mockResolvedValueOnce({ options: [{ label: 'B', value: 'b' }], hasMore: false })

    let ioCallback: IntersectionObserverCallback | undefined
    const originalIntersectionObserver = global.IntersectionObserver
    global.IntersectionObserver = vi.fn(function (this: unknown, cb: IntersectionObserverCallback) {
      ioCallback = cb
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(), takeRecords: () => [], root: null, rootMargin: '', thresholds: [] }
    }) as unknown as typeof IntersectionObserver

    render(<AsyncSearchableSelect value="" onValueChange={vi.fn()} fetchOptions={fetchOptions} />)

    await act(async () => {
      await openPopover()
    })
    await screen.findByText('A')

    await act(async () => {
      ioCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })

    expect(fetchOptions).toHaveBeenCalledTimes(2)
    expect(fetchOptions).toHaveBeenLastCalledWith({ search: '', page: 2, pageSize: 20 })
    await screen.findByText('B')
    expect(screen.getByText('A')).toBeInTheDocument()

    global.IntersectionObserver = originalIntersectionObserver
  })

  it('does not request another page once hasMore is false', async () => {
    const fetchOptions = vi.fn().mockResolvedValue({ options: [{ label: 'A', value: 'a' }], hasMore: false })
    render(<AsyncSearchableSelect value="" onValueChange={vi.fn()} fetchOptions={fetchOptions} />)

    await act(async () => {
      await openPopover()
    })
    await screen.findByText('A')

    expect(fetchOptions).toHaveBeenCalledTimes(1)
  })

  it('resets loaded options and refetches page 1 on reopen', async () => {
    const fetchOptions = vi.fn().mockResolvedValue({ options: [{ label: 'A', value: 'a' }], hasMore: false })
    render(<AsyncSearchableSelect value="" onValueChange={vi.fn()} fetchOptions={fetchOptions} />)

    await act(async () => {
      await openPopover()
    })
    await screen.findByText('A')

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await act(async () => {
      fireEvent.click(document.body)
    })

    await act(async () => {
      await openPopover()
    })

    expect(fetchOptions).toHaveBeenCalledTimes(2)
    expect(fetchOptions).toHaveBeenLastCalledWith({ search: '', page: 1, pageSize: 20 })
  })

  it('discards an out-of-order response from a stale search', async () => {
    const first = deferred<AsyncOptionsFetchResult>()
    const second = deferred<AsyncOptionsFetchResult>()
    const fetchOptions = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)

    render(
      <AsyncSearchableSelect value="" onValueChange={vi.fn()} fetchOptions={fetchOptions} debounceMs={100} />
    )

    await act(async () => {
      await openPopover()
    })

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'ab' } })
    await act(async () => { vi.advanceTimersByTime(100) })

    expect(fetchOptions).toHaveBeenCalledTimes(2)

    // "ab" (second, later-issued) resolves first; "" (first, stale) resolves after.
    await act(async () => { second.resolve({ options: [{ label: 'AB', value: 'ab' }], hasMore: false }) })
    await act(async () => { first.resolve({ options: [{ label: 'Stale', value: 'stale' }], hasMore: false }) })

    await screen.findByText('AB')
    expect(screen.queryByText('Stale')).not.toBeInTheDocument()
  })

  it('syncs the debounced search text to the URL via replace, without touching page', async () => {
    const router = createRouter()
    const fetchOptions = vi.fn().mockResolvedValue({ options: [], hasMore: false })
    renderWithRouter(
      <AsyncSearchableSelect
        value=""
        onValueChange={vi.fn()}
        fetchOptions={fetchOptions}
        paramKey="q"
        debounceMs={200}
      />,
      router
    )

    await act(async () => {
      await openPopover()
    })

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'foo' } })
    await act(async () => { vi.advanceTimersByTime(200) })

    await waitFor(() => expect(router.replace).toHaveBeenCalled())
    const url = router.replace.mock.calls[router.replace.mock.calls.length - 1][0] as string
    expect(url).toContain('q=foo')
    expect(url).not.toContain('page=')
  })

  it('falls back to selectedLabel when value is not among loaded options', () => {
    const fetchOptions = vi.fn().mockResolvedValue({ options: [], hasMore: false })
    render(
      <AsyncSearchableSelect
        value="camera-1"
        onValueChange={vi.fn()}
        fetchOptions={fetchOptions}
        selectedLabel="Camera One"
      />
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Camera One')
  })

  it('shows the placeholder, not a blank trigger, when nothing is selected', () => {
    const fetchOptions = vi.fn().mockResolvedValue({ options: [], hasMore: false })
    render(
      <AsyncSearchableSelect
        value=""
        onValueChange={vi.fn()}
        fetchOptions={fetchOptions}
        placeholder="Filter person"
      />
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Filter person')
  })

  it('uses renderSelected to render the trigger content when a value is selected', () => {
    const fetchOptions = vi.fn().mockResolvedValue({ options: [], hasMore: false })
    render(
      <AsyncSearchableSelect
        value="camera-1"
        onValueChange={vi.fn()}
        fetchOptions={fetchOptions}
        selectedLabel="Camera One"
        renderSelected={(option, value) => (
          <span data-testid="custom-selected">Custom: {option?.label ?? value}</span>
        )}
      />
    )

    expect(screen.getByTestId('custom-selected')).toHaveTextContent('Custom: camera-1')
  })

  it('ignores renderSelected when nothing is selected, falling back to the placeholder', () => {
    const fetchOptions = vi.fn().mockResolvedValue({ options: [], hasMore: false })
    render(
      <AsyncSearchableSelect
        value=""
        onValueChange={vi.fn()}
        fetchOptions={fetchOptions}
        placeholder="Filter person"
        renderSelected={() => <span data-testid="custom-selected">should not render</span>}
      />
    )

    expect(screen.queryByTestId('custom-selected')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('Filter person')
  })
})
