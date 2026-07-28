'use client'

import { useState, useTransition, useOptimistic, useMemo } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2, Pencil, Check, X, Plus, ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react'
import type { ServicePlan } from '@/types/services'
import {
  deleteServicePlan, toggleServicePlanAvailability,
  updateServicePlan,
} from '@/actions/admin/service'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface EditState {
  name: string
  subtitle: string
  price: string
  price_note: string
  description: string
  tags: string[]
  highlighted: boolean
  is_available: boolean
}

interface Props {
  services: ServicePlan[]
}

type SortKey = 'name' | 'price' | 'highlighted' | 'is_available'

export function ServiceTable({ services }: Props) {
  const [, startTransition] = useTransition()
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    if (!sortKey) return services
    const sorted = [...services].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'highlighted' || sortKey === 'is_available') {
        cmp = Number(a[sortKey]) - Number(b[sortKey])
      } else {
        const va = a[sortKey]
        const vb = b[sortKey]
        if (va < vb) cmp = -1
        else if (va > vb) cmp = 1
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [services, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 inline h-3 w-3" />
      : <ArrowDown className="ml-1 inline h-3 w-3" />
  }

  function SortHeader({ label, column, className }: { label: string; column: SortKey; className?: string }) {
    return (
      <th
        className={`${className ?? ''} px-3 py-2.5 text-left text-xs font-medium cursor-pointer select-none hover:text-brand-neutral-600 transition-colors ${sortKey === column ? 'text-brand-neutral-700' : 'text-brand-neutral-400'}`}
        onClick={() => toggleSort(column)}
      >
        {label}
        <SortIcon column={column} />
      </th>
    )
  }
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [tagInput, setTagInput] = useState('')

  const [optimisticAvailability, updateOptimistic] = useOptimistic(
    Object.fromEntries(services.map((s) => [s.id, s.is_available])),
    (state, { id, value }: { id: number; value: boolean }) => ({ ...state, [id]: value })
  )

  function startEdit(service: ServicePlan) {
    setEditingId(service.id)
    setEditState({
      name: service.name,
      subtitle: service.subtitle,
      price: String(service.price),
      price_note: service.price_note ?? '',
      description: service.description,
      tags: [...service.tags],
      highlighted: service.highlighted,
      is_available: service.is_available,
    })
    setTagInput('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState(null)
    setTagInput('')
  }

  function addEditTag() {
    if (!editState) return
    const trimmed = tagInput.trim()
    if (trimmed && !editState.tags.includes(trimmed)) {
      setEditState({ ...editState, tags: [...editState.tags, trimmed] })
    }
    setTagInput('')
  }

  function removeEditTag(tag: string) {
    if (!editState) return
    setEditState({ ...editState, tags: editState.tags.filter((t) => t !== tag) })
  }

  function handleSave(id: number) {
    if (!editState) return
    const parsedPrice = Number(editState.price)
    if (!editState.price || isNaN(parsedPrice) || parsedPrice <= 0) { toast.error('Price must be a positive number'); return }
    if (!editState.name.trim()) { toast.error('Name is required'); return }
    if (!editState.subtitle.trim()) { toast.error('Subtitle is required'); return }
    if (!editState.description.trim()) { toast.error('Description is required'); return }

    setSavingIds((prev) => new Set(prev).add(id))
    startTransition(async () => {
      const result = await updateServicePlan(id, {
        name: editState.name.trim(),
        subtitle: editState.subtitle.trim(),
        price: parsedPrice,
        price_note: editState.price_note.trim() || null,
        description: editState.description.trim(),
        tags: editState.tags,
        highlighted: editState.highlighted,
        is_available: editState.is_available,
      })
      setSavingIds((prev) => { const n = new Set(prev); n.delete(id); return n })
      if (result?.error) { toast.error(result.error); return }
      toast.success('Service plan updated')
      setEditingId(null)
      setEditState(null)
    })
  }

  function handleDelete(id: number) {
    setDeletingIds((prev) => new Set(prev).add(id))
    startTransition(async () => {
      const result = await deleteServicePlan(id)
      setDeletingIds((prev) => { const n = new Set(prev); n.delete(id); return n })
      if (result?.error) { toast.error(result.error); return }
      toast.success('Service plan deleted')
    })
  }

  function handleToggle(id: number, value: boolean) {
    setTogglingIds((prev) => new Set(prev).add(id))
    startTransition(async () => {
      updateOptimistic({ id, value })
      const result = await toggleServicePlanAvailability(id, value)
      setTogglingIds((prev) => { const n = new Set(prev); n.delete(id); return n })
      if (result?.error) { updateOptimistic({ id, value: !value }); toast.error(result.error); return }
      toast.success('Availability updated')
    })
  }

  return (
    <div className="bg-white border border-brand-neutral-200 rounded-xl overflow-hidden">
      <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="bg-brand-neutral-50 border-b border-brand-neutral-200">
            <SortHeader label="Name" column="name" className="w-28" />
            <th className="px-3 py-2.5 text-left text-xs font-medium text-brand-neutral-400">Subtitle</th>
            <SortHeader label="Price" column="price" className="w-32" />
            <th className="w-44 px-3 py-2.5 text-left text-xs font-medium text-brand-neutral-400">Tags</th>
            <SortHeader label="Available" column="is_available" className="w-28" />
            <th className="w-32 px-3 py-2.5 text-right text-xs font-medium text-brand-neutral-400">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-brand-neutral-100">
          {services.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Inbox className="size-8 text-brand-neutral-300 mx-auto" />
                  <p className="text-sm text-brand-neutral-400">
                    No service plans yet. Click "Add service plan" to create one.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            sorted.map((service) => {
              const isDeleting = deletingIds.has(service.id)
              const isToggling = togglingIds.has(service.id)
              const isSaving = savingIds.has(service.id)
              const isEditing = editingId === service.id
              const isAvailable = optimisticAvailability[service.id]
              const isBusy = isDeleting || isToggling || isSaving

              return (
                <tr key={service.id} className={`${isDeleting ? 'opacity-40' : ''} hover:bg-brand-neutral-50/50 transition-colors`}>
                  <td className="px-3 py-3 font-medium text-brand-neutral-900 text-sm">
                    {isEditing ? (
                      <Input className="h-7 text-xs" value={editState!.name} onChange={(e) => setEditState((p) => ({ ...p!, name: e.target.value }))} />
                    ) : service.name}
                  </td>

                  <td className="px-3 py-3">
                    {isEditing ? (
                      <Input className="h-7 text-xs" value={editState!.subtitle} onChange={(e) => setEditState((p) => ({ ...p!, subtitle: e.target.value }))} />
                    ) : (
                      <span className="text-xs text-brand-neutral-400 uppercase tracking-wide">{service.subtitle}</span>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input type="number" min="1" step="0.01" className="h-7 text-xs" value={editState!.price} onChange={(e) => setEditState((p) => ({ ...p!, price: e.target.value }))} />
                        <Input placeholder="Price note" className="h-7 text-xs" value={editState!.price_note} onChange={(e) => setEditState((p) => ({ ...p!, price_note: e.target.value }))} />
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm text-brand-neutral-900">
                          ${Number(service.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {service.price_note && (
                          <span className="block text-xs text-brand-neutral-400 mt-0.5">{service.price_note}</span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    {isEditing ? (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          <Input
                            className="h-7 text-xs"
                            placeholder="Add tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEditTag() } }}
                          />
                          <button type="button" onClick={addEditTag} className="border border-brand-neutral-200 rounded-md px-2 text-brand-neutral-500 hover:bg-brand-neutral-50">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {editState!.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 bg-brand-neutral-100 text-brand-neutral-600 border border-brand-neutral-200 rounded-md px-1.5 py-0.5 text-xs">
                              {tag}
                              <button type="button" onClick={() => removeEditTag(tag)} className="hover:text-brand-primary-600"><X className="h-2.5 w-2.5" /></button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {service.tags.length === 0
                          ? <span className="text-xs text-brand-neutral-300">—</span>
                          : service.tags.map((tag) => (
                            <span key={tag} className="bg-brand-neutral-100 text-brand-neutral-500 border border-brand-neutral-200 rounded-md px-2 py-0.5 text-xs">{tag}</span>
                          ))
                        }
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => setEditState((p) => ({ ...p!, is_available: !p!.is_available }))}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${editState!.is_available
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-brand-neutral-100 text-brand-neutral-500 border border-brand-neutral-200'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${editState!.is_available ? 'bg-green-500' : 'bg-brand-neutral-300'}`} />
                        {editState!.is_available ? 'Active' : 'Inactive'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggle(service.id, !isAvailable)}
                        disabled={isBusy}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${isAvailable
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          : 'bg-brand-neutral-100 text-brand-neutral-500 border border-brand-neutral-200 hover:bg-brand-neutral-200'
                          }`}
                      >
                        {isToggling
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-brand-neutral-300'}`} />
                        }
                        {isAvailable ? 'Active' : 'Inactive'}
                      </button>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(service.id)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1 bg-brand-neutral-900 hover:bg-brand-neutral-700 text-white rounded-md px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            {isSaving ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1 border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 rounded-md px-2.5 py-1 text-xs"
                          >
                            <X className="h-3 w-3" /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(service)}
                            disabled={isBusy || editingId !== null}
                            className="inline-flex items-center gap-1 border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 rounded-md px-2.5 py-1 text-xs disabled:opacity-40"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                disabled={isBusy || editingId !== null}
                                className="inline-flex items-center gap-1 bg-brand-primary-50 text-brand-primary-700 border border-brand-primary-100 hover:bg-brand-primary-100 rounded-md px-2.5 py-1 text-xs disabled:opacity-40"
                              >
                                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                {isDeleting ? 'Deleting…' : 'Delete'}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete service plan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <strong>{service.name}</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction variant="destructive" onClick={() => handleDelete(service.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}