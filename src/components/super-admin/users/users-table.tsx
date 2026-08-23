'use client'

import { useState, useMemo } from 'react'
import { User, FileText, Inbox, SearchX } from 'lucide-react'
import type { UserWithProfile } from '@/actions/admin/users'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { FilterBar, FilterInput, FilterSelect, FilterClear } from '@/components/admin/shared/filters'

interface Props {
  users: UserWithProfile[]
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  paused: 'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-sky-50 text-sky-700 border border-sky-200',
  payment_failed: 'bg-orange-50 text-orange-700 border border-orange-200',
}

export function UsersTable({ users }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.application_code?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesStatus = statusFilter === 'all' ||
        user.application_status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [users, searchQuery, statusFilter])

  function handleClear() {
    setSearchQuery('')
    setStatusFilter('all')
  }

  return (
    <div className="space-y-4">
      <FilterBar>
        <FilterInput
          label="Search"
          placeholder="Search by name, email, or application code..."
          defaultValue={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterSelect
          label="Status"
          placeholder="All Status"
          value={statusFilter}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'paused', label: 'Paused' },
          ]}
          onChange={setStatusFilter}
        />
        <FilterClear onClick={handleClear} />
      </FilterBar>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            {searchQuery || statusFilter !== 'all' ? (
              <SearchX className="size-8 text-brand-neutral-300" />
            ) : (
              <Inbox className="size-8 text-brand-neutral-300" />
            )}
            <p className="text-sm text-brand-neutral-400">
              {searchQuery || statusFilter !== 'all' ? 'No users match your filters.' : 'No users registered yet.'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.user_id} className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-secondary-50 text-brand-secondary-700">
                  <User className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-neutral-900 truncate">{user.name}</p>
                  <p className="text-xs text-brand-neutral-500 truncate">{user.email}</p>
                </div>
                {user.application_status ? (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${
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
                  <span className="text-xs text-brand-neutral-300 shrink-0">No application</span>
                )}
              </div>

              <div className="px-4 py-2.5 flex items-center justify-between gap-2 border-t border-brand-neutral-100 bg-brand-neutral-50/40">
                <span className="text-xs text-brand-neutral-500 truncate">
                  <span className="text-brand-neutral-400">Nationality:</span>{' '}
                  {user.nationality || '\u2014'}
                </span>
                <span className="text-xs text-brand-neutral-400 shrink-0">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>

              {user.application_code && (
                <div className="px-4 py-2.5 border-t border-brand-neutral-100 flex items-center gap-1.5 text-xs text-brand-neutral-700">
                  <FileText className="size-3.5 shrink-0" />
                  <span className="truncate font-medium">{user.application_code}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-neutral-100">
          <span className="text-sm font-medium text-brand-neutral-900">Client Records</span>
          <span className="text-xs text-brand-neutral-500">{filteredUsers.length} of {users.length} records</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-brand-neutral-50 border-b border-brand-neutral-200">
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">User</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Email</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Nationality</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Application</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    {searchQuery || statusFilter !== 'all' ? (
                      <SearchX className="size-8 text-brand-neutral-300" />
                    ) : (
                      <Inbox className="size-8 text-brand-neutral-300" />
                    )}
                    <p className="text-sm text-brand-neutral-400">
                      {searchQuery || statusFilter !== 'all' ? 'No users match your filters.' : 'No users registered yet.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id} className="[&>td]:px-4 [&>td]:py-3">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-brand-secondary-50 text-brand-secondary-700">
                        <User className="size-4" />
                      </div>
                      <span className="font-medium text-brand-neutral-900">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-brand-neutral-500">{user.email}</TableCell>
                  <TableCell className="text-brand-neutral-500">{user.nationality || '—'}</TableCell>
                  <TableCell>
                    {user.application_code ? (
                      <span className="inline-flex items-center gap-1.5 text-brand-neutral-700">
                        <FileText className="size-3.5" />
                        {user.application_code}
                      </span>
                    ) : (
                      <span className="text-brand-neutral-300">—</span>
                    )}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-brand-neutral-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
