import Link from 'next/link'
import { UserX } from 'lucide-react'

export default function ClientProfileNotFound() {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-neutral-200 bg-white py-16">
        <UserX className="size-10 text-brand-neutral-300" />
        <div className="text-center space-y-1">
          <h1 className="text-lg font-semibold text-brand-neutral-900">Client not found</h1>
          <p className="text-sm text-brand-neutral-400">This client profile no longer exists or the link is invalid.</p>
        </div>
        <Link
          href="/admin/profiles"
          className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors"
        >
          Back to Client Profiles
        </Link>
      </div>
    </div>
  )
}