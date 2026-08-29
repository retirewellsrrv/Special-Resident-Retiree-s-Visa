'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type AutoRefreshProps = {
  /** Poll interval in ms. Defaults to 45s — above the admin dashboard's 30s
   *  data-cache TTL, so most polls hit fresh data without extra DB load. */
  intervalMs?: number
}

/**
 * Re-renders the current route's server components on an interval while the
 * tab is visible, plus once immediately when the tab regains visibility.
 * Renders nothing.
 *
 * Used on the admin / super-admin dashboards so KPI stats stay current for
 * tabs left open. Server-side caches (`unstable_cache` tags) absorb repeated
 * refreshes; mutations invalidate those tags via `revalidateTag`, so this
 * component only needs to trigger `router.refresh()`.
 */
export function AutoRefresh({ intervalMs = 45_000 }: AutoRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const refreshIfVisible = () => {
      if (!cancelled && document.visibilityState === 'visible') {
        router.refresh()
      }
    }

    const id = setInterval(refreshIfVisible, intervalMs)

    // Correct stale numbers immediately when returning to the tab
    document.addEventListener('visibilitychange', refreshIfVisible)

    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [intervalMs, router])

  return null
}
