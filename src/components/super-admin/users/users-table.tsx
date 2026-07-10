'use client'

import { useState, useMemo } from 'react'
import { User, FileText, Search, X } from 'lucide-react'
import type { UserWithProfile } from '@/actions/admin/users'
import { useDebounce } from '@/hooks/use-debounce'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Props {
  users: UserWithProfile[]
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  paused: 'bg-blue-50 text-blue-700 border border-blue-200',
}

export function UsersTable({ users }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = !debouncedSearch ||
        user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (user.application_code?.toLowerCase().includes(debouncedSearch.toLowerCase()) ?? false)
      const matchesStatus = statusFilter === 'all' ||
        user.application_status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [users, debouncedSearch, statusFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, email, or application code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full pl-8 pr-8 rounded-lg border border-brand-neutral-200 bg-white text-sm text-brand-neutral-900 outline-none focus:border-brand-primary-600 focus:ring-2 focus:ring-brand-primary-600/10 transition-all placeholder:text-brand-neutral-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-neutral-400 hover:text-brand-neutral-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-40 rounded-lg border-brand-neutral-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-brand-neutral-400">
                  {searchQuery || statusFilter !== 'all' ? 'No users match your filters.' : 'No users registered yet.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
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
