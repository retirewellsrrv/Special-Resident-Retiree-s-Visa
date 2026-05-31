'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Service } from '@/types/services'
import { deleteService, toggleServiceAvailability, updateService } from '@/actions/admin/service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'

type ServiceType = 'basic' | 'premium' | 'vip'

interface EditState {
  type: ServiceType
  price: string
  description: string
}

interface Props {
  services: Service[]
}

export function ServiceTable({ services }: Props) {
  const [, startTransition] = useTransition()
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)

  const [optimisticAvailability, updateOptimistic] = useOptimistic(
    Object.fromEntries(services.map((s) => [s.id, s.is_available ?? false])),
    (state, { id, value }: { id: number; value: boolean }) => ({ ...state, [id]: value })
  )

  function startEdit(service: Service) {
    setEditingId(service.id)
    setEditState({
      type: service.type as ServiceType,
      price: String(service.price ?? ''),
      description: service.description ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState(null)
  }

  function handleSave(id: number) {
    if (!editState) return

    const parsedPrice = Number(editState.price)
    if (!editState.price || isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('Price must be a positive number')
      return
    }

    setSavingIds((prev) => new Set(prev).add(id))
    startTransition(async () => {
      const result = await updateService(id, {
        type: editState.type,
        price: parsedPrice,
        description: editState.description.trim() || null,
      })
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Service updated')
      setEditingId(null)
      setEditState(null)
    })
  }

  function handleDelete(id: number) {
    setDeletingIds((prev) => new Set(prev).add(id))
    startTransition(async () => {
      const result = await deleteService(id)
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      if (result?.error) { toast.error(result.error); return }
      toast.success('Service deleted')
    })
  }

  function handleToggle(id: number, value: boolean) {
    setTogglingIds((prev) => new Set(prev).add(id))
    startTransition(async () => {
      updateOptimistic({ id, value })
      const result = await toggleServiceAvailability(id, value)
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      if (result?.error) {
        updateOptimistic({ id, value: !value })
        toast.error(result.error)
        return
      }
      toast.success('Availability updated')
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No services found
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => {
              const isDeleting = deletingIds.has(service.id)
              const isToggling = togglingIds.has(service.id)
              const isSaving = savingIds.has(service.id)
              const isEditing = editingId === service.id
              const isAvailable = optimisticAvailability[service.id]
              const isBusy = isDeleting || isToggling || isSaving

              return (
                <TableRow key={service.id} className={isDeleting ? 'opacity-50' : ''}>
                  <TableCell>{service.id}</TableCell>

                  {/* Type */}
                  <TableCell>
                    {isEditing ? (
                      <Select
                        value={editState!.type}
                        onValueChange={(v) =>
                          setEditState((prev) => ({ ...prev!, type: v as ServiceType }))
                        }
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(['basic', 'premium', 'vip'] as ServiceType[]).map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="capitalize">{service.type}</span>
                    )}
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        className="h-8 w-28"
                        value={editState!.price}
                        onChange={(e) =>
                          setEditState((prev) => ({ ...prev!, price: e.target.value }))
                        }
                      />
                    ) : (
                      service.price != null
                        ? `₱${Number(service.price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '—'
                    )}
                  </TableCell>

                  {/* Description */}
                  <TableCell className="max-w-[260px]">
                    {isEditing ? (
                      <Input
                        className="h-8"
                        value={editState!.description}
                        onChange={(e) =>
                          setEditState((prev) => ({ ...prev!, description: e.target.value }))
                        }
                      />
                    ) : (
                      <span className="truncate block text-muted-foreground">
                        {service.description ?? 'No description'}
                      </span>
                    )}
                  </TableCell>

                  {/* Toggle */}
                  <TableCell>
                    <Switch
                      checked={isAvailable}
                      disabled={isBusy || isEditing}
                      aria-label={`Toggle availability for service ${service.id}`}
                      onCheckedChange={(value) => handleToggle(service.id, value)}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          {/* Save */}
                          <Button
                            size="sm"
                            disabled={isSaving}
                            onClick={() => handleSave(service.id)}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
                              'bg-neutral-900 text-white border border-neutral-900',
                              'hover:bg-neutral-700 hover:border-neutral-700',
                              'disabled:opacity-50 disabled:cursor-not-allowed',
                              'transition-all duration-150 rounded-md'
                            )}
                          >
                            {isSaving ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            {isSaving ? 'Saving…' : 'Save'}
                          </Button>

                          {/* Cancel */}
                          <Button
                            size="sm"
                            disabled={isSaving}
                            onClick={cancelEdit}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
                              'bg-transparent text-muted-foreground border border-input',
                              'hover:bg-muted hover:text-foreground',
                              'disabled:opacity-50 disabled:cursor-not-allowed',
                              'transition-all duration-150 rounded-md'
                            )}
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* Edit */}
                          <Button
                            size="sm"
                            disabled={isBusy || editingId !== null}
                            onClick={() => startEdit(service)}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
                              'bg-transparent text-muted-foreground border border-input',
                              'hover:bg-muted hover:text-foreground',
                              'disabled:opacity-50 disabled:cursor-not-allowed',
                              'transition-all duration-150 rounded-md'
                            )}
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>

                          {/* Delete */}
                          <Button
                            size="sm"
                            disabled={isBusy || editingId !== null}
                            onClick={() => handleDelete(service.id)}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide',
                              'bg-red-50 text-red-700 border border-red-200',
                              'hover:bg-red-600 hover:text-white hover:border-red-600',
                              'disabled:opacity-40 disabled:cursor-not-allowed',
                              'transition-all duration-150 rounded-md'
                            )}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            {isDeleting ? 'Deleting…' : 'Delete'}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}