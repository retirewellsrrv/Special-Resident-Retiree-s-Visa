'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Ban, CheckCircle, Shield, Mail, MailX, Inbox, SearchX } from 'lucide-react'
import type { AdminWithUser } from '@/actions/admin/admins'
import { createAdmin, toggleAdminActive, deleteAdmin } from '@/actions/admin/admins'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { FilterBar, FilterInput, FilterSelect, FilterClear } from '@/components/admin/shared/filters'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  admins: AdminWithUser[]
}

export function AdminTable({ admins }: Props) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createBusy, setCreateBusy] = useState(false)

  function handleToggle(userId: string, current: boolean | null) {
    setTogglingId(userId)
    startTransition(async () => {
      const result = await toggleAdminActive(userId, !current)
      setTogglingId(null)
      if (result?.error) { toast.error(result.error); return }
      toast.success(current ? 'Admin disabled' : 'Admin enabled')
    })
  }

  function handleDelete(userId: string) {
    setDeletingId(userId)
    startTransition(async () => {
      const result = await deleteAdmin(userId)
      setDeletingId(null)
      if (result?.error) { toast.error(result.error); return }
      toast.success('Admin deleted')
    })
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreateBusy(true)
    const formData = new FormData()
    formData.set('name', createName)
    formData.set('email', createEmail)
    formData.set('password', createPassword)

    startTransition(async () => {
      const result = await createAdmin(formData)
      setCreateBusy(false)
      if (result?.error) { toast.error(result.error); return }
      toast.success(result?.message ?? 'Admin created')
      setCreateOpen(false)
      setCreateName('')
      setCreateEmail('')
      setCreatePassword('')
    })
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch = !searchQuery ||
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && admin.is_active) ||
        (statusFilter === 'inactive' && !admin.is_active)
      return matchesSearch && matchesStatus
    })
  }, [admins, searchQuery, statusFilter])

  function handleClear() {
    setSearchQuery('')
    setStatusFilter('all')
  }

  return (
    <div className="space-y-4">
      <FilterBar>
        <FilterInput
          label="Search"
          placeholder="Search by name or email..."
          defaultValue={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterSelect
          label="Status"
          placeholder="All Status"
          value={statusFilter}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          onChange={setStatusFilter}
        />
        <FilterClear onClick={handleClear} />
      </FilterBar>

      {/* Create dialog */}
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors">
              <Plus className="h-4 w-4" />
              Add Admin
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create admin account</DialogTitle>
              <DialogDescription>
                This will create a new admin user with access to the admin dashboard.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-brand-neutral-700">Full name</label>
                <Input
                  id="name"
                  placeholder="e.g. Juan Dela Cruz"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-brand-neutral-700">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. admin@srrv.gov.ph"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-brand-neutral-700">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={createBusy}
                  className="bg-brand-primary-600 hover:bg-brand-primary-800 text-white"
                >
                  {createBusy ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating…</> : 'Create Admin'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-3">
        {filteredAdmins.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            {searchQuery || statusFilter !== 'all' ? (
              <SearchX className="size-8 text-brand-neutral-300" />
            ) : (
              <Inbox className="size-8 text-brand-neutral-300" />
            )}
            <p className="text-sm text-brand-neutral-400">
              {searchQuery || statusFilter !== 'all' ? 'No admins match your filters.' : 'No admin accounts yet. Click "Add Admin" to create one.'}
            </p>
          </div>
        ) : (
          filteredAdmins.map((admin) => {
            const isBusy = deletingId === admin.user_id || togglingId === admin.user_id
            return (
              <div
                key={admin.user_id}
                className={`bg-white border border-brand-neutral-200 rounded-xl overflow-hidden ${deletingId === admin.user_id ? 'opacity-40' : ''}`}
              >
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary-50 text-brand-primary-700">
                    <Shield className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-neutral-900 truncate">{admin.name}</p>
                    <p className="text-xs text-brand-neutral-500 truncate">{admin.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${
                      admin.is_active
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-brand-neutral-100 text-brand-neutral-500 border border-brand-neutral-200'
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${admin.is_active ? 'bg-green-500' : 'bg-brand-neutral-300'}`} />
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="px-4 py-2.5 flex items-center justify-between gap-2 border-t border-brand-neutral-100 bg-brand-neutral-50/40">
                  <div className="flex items-center gap-1.5 text-xs">
                    {admin.email_confirmed ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Mail className="size-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <MailX className="size-3.5" /> Pending
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-brand-neutral-400">
                    Joined{' '}
                    {new Date(admin.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="px-4 py-2.5 flex items-center gap-2 border-t border-brand-neutral-100">
                  <button
                    onClick={() => handleToggle(admin.user_id, admin.is_active)}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1 border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 rounded-md px-2.5 py-1.5 text-xs disabled:opacity-40 transition-colors"
                  >
                    {togglingId === admin.user_id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : admin.is_active ? (
                      <Ban className="h-3 w-3" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {admin.is_active ? 'Disable' : 'Enable'}
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 bg-brand-primary-50 text-brand-primary-700 border border-brand-primary-100 hover:bg-brand-primary-100 rounded-md px-2.5 py-1.5 text-xs disabled:opacity-40 transition-colors"
                      >
                        {deletingId === admin.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete admin account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete <strong>{admin.name}</strong>? This will remove their admin profile and disable their access. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => handleDelete(admin.user_id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-neutral-100">
          <span className="text-sm font-medium text-brand-neutral-900">Admin Accounts</span>
          <span className="text-xs text-brand-neutral-500">{filteredAdmins.length} of {admins.length} records</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-brand-neutral-50 border-b border-brand-neutral-200">
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Admin</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Email</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Email Verified</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Created</TableHead>
              <TableHead className="text-xs font-medium text-brand-neutral-400 uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    {searchQuery || statusFilter !== 'all' ? (
                      <SearchX className="size-8 text-brand-neutral-300" />
                    ) : (
                      <Inbox className="size-8 text-brand-neutral-300" />
                    )}
                    <p className="text-sm text-brand-neutral-400">
                      {searchQuery || statusFilter !== 'all' ? 'No admins match your filters.' : 'No admin accounts yet. Click "Add Admin" to create one.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => {
                const isBusy = deletingId === admin.user_id || togglingId === admin.user_id

                return (
                  <TableRow key={admin.user_id} className={`${deletingId === admin.user_id ? 'opacity-40' : ''} [&>td]:px-4 [&>td]:py-3`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-brand-primary-50 text-brand-primary-700">
                          <Shield className="size-4" />
                        </div>
                        <span className="font-medium text-brand-neutral-900">{admin.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-brand-neutral-500">{admin.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          admin.is_active
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-brand-neutral-100 text-brand-neutral-500 border border-brand-neutral-200'
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${admin.is_active ? 'bg-green-500' : 'bg-brand-neutral-300'}`} />
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {admin.email_confirmed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
                          <Mail className="size-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-600">
                          <MailX className="size-3.5" />
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-brand-neutral-400 text-xs">
                      {new Date(admin.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggle(admin.user_id, admin.is_active)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1 border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 rounded-md px-2.5 py-1 text-xs disabled:opacity-40 transition-colors"
                        >
                          {togglingId === admin.user_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : admin.is_active ? (
                            <Ban className="h-3 w-3" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {admin.is_active ? 'Disable' : 'Enable'}
                        </button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 bg-brand-primary-50 text-brand-primary-700 border border-brand-primary-100 hover:bg-brand-primary-100 rounded-md px-2.5 py-1 text-xs disabled:opacity-40 transition-colors"
                            >
                              {deletingId === admin.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                              Delete
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete admin account</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <strong>{admin.name}</strong>? This will remove their admin profile and disable their access. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction variant="destructive" onClick={() => handleDelete(admin.user_id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
