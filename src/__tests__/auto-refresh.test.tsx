import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { AutoRefresh } from '../components/shared/auto-refresh'

const refreshMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}))

describe('AutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    // jsdom reports 'visible' by default
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing', () => {
    const { container } = render(<AutoRefresh />)
    expect(container).toBeEmptyDOMElement()
  })

  it('calls router.refresh after each interval while the tab is visible', () => {
    render(<AutoRefresh intervalMs={1000} />)

    expect(refreshMock).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(refreshMock).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(3000)
    expect(refreshMock).toHaveBeenCalledTimes(4)
  })

  it('does not refresh while the tab is hidden', () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })

    render(<AutoRefresh intervalMs={1000} />)
    vi.advanceTimersByTime(5000)

    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('refreshes once immediately when the tab becomes visible again', () => {
    render(<AutoRefresh intervalMs={60_000} />)

    // Simulate returning to a hidden tab
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(refreshMock).toHaveBeenCalledTimes(1)

    // The pending 60s poll still fires afterwards
    vi.advanceTimersByTime(60_000)
    expect(refreshMock).toHaveBeenCalledTimes(2)
  })

  it('stops refreshing after unmount', () => {
    const { unmount } = render(<AutoRefresh intervalMs={1000} />)

    unmount()
    vi.advanceTimersByTime(10_000)

    expect(refreshMock).not.toHaveBeenCalled()
  })
})
