'use client'

import { AlertTriangle } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center min-h-[60vh]">
      <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="size-6" />
      </div>
      <h1 className="text-xl font-semibold text-brand-neutral-900">Something went wrong</h1>
      <p className="max-w-md text-sm text-brand-neutral-500">
        {error.message ?? 'An unexpected error occurred in the admin portal.'}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-brand-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary-800"
      >
        Try again
      </button>
    </div>
  )
}
