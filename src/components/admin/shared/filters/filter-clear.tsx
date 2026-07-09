'use client'

import { X } from 'lucide-react'

interface FilterClearProps {
  onClick: () => void
  disabled?: boolean
}

export function FilterClear({ onClick, disabled }: FilterClearProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg border border-brand-primary-200 bg-brand-primary-50 text-sm text-brand-primary-600 font-medium hover:bg-brand-primary-100 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <X className="h-3.5 w-3.5" />
      Clear
    </button>
  )
}
