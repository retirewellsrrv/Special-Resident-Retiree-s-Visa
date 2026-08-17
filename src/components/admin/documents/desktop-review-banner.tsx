'use client'

import { useState } from 'react'
import { MonitorSmartphone, X } from 'lucide-react'

const STORAGE_KEY = 'srrv-doc-review-banner-dismissed'

/**
 * Mobile-only nudge: document verification is a detail-critical task, so we
 * suggest a larger screen without hard-gating the workflow. Dismissal is
 * remembered per device (localStorage).
 */
export function DesktopReviewBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  })

  if (dismissed) return null

  return (
    <div className="lg:hidden flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
      <MonitorSmartphone className="size-4 shrink-0 mt-0.5" />
      <p className="flex-1 leading-relaxed">
        Document verification is best on a larger screen. PDFs open in your device's reader — use a desktop for detailed review.
      </p>
      <button
        onClick={() => {
          window.localStorage.setItem(STORAGE_KEY, '1')
          setDismissed(true)
        }}
        className="shrink-0 rounded-md p-0.5 text-amber-500 hover:bg-amber-100 hover:text-amber-700 transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
