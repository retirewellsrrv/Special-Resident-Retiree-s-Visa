'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Ban, CheckCircle, Shield, Mail, MailX, Search, X } from 'lucide-react'
import type { AdminWithUser } from '@/actions/admin/admins'
import { createAdmin, toggleAdminActive, deleteAdmin } from '@/actions/admin/admins'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
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
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch = !debouncedSearch ||
        admin.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        admin.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && admin.is_active) ||
        (statusFilter === 'inactive' && !admin.is_active)
      return matchesSearch && matchesStatus
    })
  }, [admins, debouncedSearch, statusFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
          <SelectTrigger className="h-9 w-36 rounded-lg border-brand-neutral-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {/* Table */}
      <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-brand-neutral-50 border-b border-brand-neutral-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Admin</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Email Verified</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-brand-neutral-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-neutral-100">
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-brand-neutral-400">
                  {searchQuery || statusFilter !== 'all' ? 'No admins match your filters.' : 'No admin accounts yet. Click "Add Admin" to create one.'}
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => {
                const isBusy = deletingId === admin.user_id || togglingId === admin.user_id

                return (
                  <tr key={admin.user_id} className={`${deletingId === admin.user_id ? 'opacity-40' : ''} hover:bg-brand-neutral-50/50 transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-brand-primary-50 text-brand-primary-700">
                          <Shield className="size-4" />
                        </div>
                        <span className="font-medium text-brand-neutral-900">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-neutral-500">{admin.email}</td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3 text-brand-neutral-400 text-xs">
                      {new Date(admin.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
