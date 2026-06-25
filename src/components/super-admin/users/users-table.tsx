'use client'

import { User, FileText } from 'lucide-react'
import type { UserWithProfile } from '@/actions/admin/users'

interface Props {
  users: UserWithProfile[]
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  paused: 'bg-blue-50 text-blue-700 border border-blue-200',
  pending_documents: 'bg-purple-50 text-purple-700 border border-purple-200',
}

export function UsersTable({ users }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-brand-neutral-50 border-b border-brand-neutral-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Nationality</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Application</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-neutral-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-brand-neutral-400">
                  No users registered yet.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.user_id} className="hover:bg-brand-neutral-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-brand-secondary-50 text-brand-secondary-700">
                        <User className="size-4" />
                      </div>
                      <span className="font-medium text-brand-neutral-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-neutral-500">{user.email}</td>
                  <td className="px-4 py-3 text-brand-neutral-500">{user.nationality || '—'}</td>
                  <td className="px-4 py-3">
                    {user.application_code ? (
                      <span className="inline-flex items-center gap-1.5 text-brand-neutral-700">
                        <FileText className="size-3.5" />
                        {user.application_code}
                      </span>
                    ) : (
                      <span className="text-brand-neutral-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.application_status ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          STATUS_STYLES[user.application_status] ?? 'bg-brand-neutral-100 text-brand-neutral-500 border border-brand-neutral-200'
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${
                          user.application_status === 'approved' ? 'bg-green-500' :
                          user.application_status === 'rejected' ? 'bg-red-500' :
                          user.application_status === 'paused' ? 'bg-blue-500' :
                          user.application_status === 'pending_documents' ? 'bg-purple-500' :
                          'bg-amber-500'
                        }`} />
                        {user.application_status.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-brand-neutral-300 text-xs">No application</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brand-neutral-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
