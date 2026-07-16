import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: number[] = []
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = (): IntersectionObserverEntry[] => []
}

// jsdom has no IntersectionObserver implementation.
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

class MockResizeObserver implements ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// jsdom has no ResizeObserver implementation; Radix Popper (used by Popover) needs one.
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// jsdom has no layout engine, so scrollIntoView (used by cmdk for keyboard nav) is unimplemented.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}
