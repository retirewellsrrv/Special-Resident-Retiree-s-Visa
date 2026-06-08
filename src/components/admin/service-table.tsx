'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2, Pencil, Check, X, Plus, Flag, Circle } from 'lucide-react'
import type { ServicePlan } from '@/types/services'
import { deleteServicePlan, toggleServicePlanAvailability, updateServicePlan, setFeaturedService } from '@/actions/admin/service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type ServiceType = 'basic' | 'premium' | 'vip'

const TYPE_BADGE: Record<ServiceType, 'outline' | 'default' | 'destructive'> = {
  basic: 'outline',
  premium: 'default',
  vip: 'destructive',
}

interface EditState {
  type: ServiceType
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

export function ServiceTable({ services }: Props) {
  const [, startTransition] = useTransition()
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())
  const [featuringIds, setFeaturingIds] = useState<Set<number>>(new Set())
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
      type: service.type as ServiceType,
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
    if (!editState.price || isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('Price must be a positive number')
      return
    }
    if (!editState.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!editState.subtitle.trim()) {
      toast.error('Subtitle is required')
      return
    }
    if (!editState.description.trim()) {
      toast.error('Description is required')
      return
    }

    setSavingIds((prev) => new Set(prev).add(id))
    startTransition(async () => {
      const result = await updateServicePlan(id, {
        type: editState.type,
        name: editState.name.trim(),
        subtitle: editState.subtitle.trim(),
        price: parsedPrice,
        price_note: editState.price_note.trim() || null,
        description: editState.description.trim(),
        tags: editState.tags,
        highlighted: editState.highlighted,
        is_available: editState.is_available,
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
      toast.success('Service plan updated')
      setEditingId(null)
      setEditState(null)
    })
  }

  function handleSetFeatured(service: ServicePlan) {
    setFeaturingIds((prev) => new Set(prev).add(service.id))
    startTransition(async () => {
      if (service.highlighted) {
        const result = await updateServicePlan(service.id, { highlighted: false })
        setFeaturingIds((prev) => {
          const next = new Set(prev)
          next.delete(service.id)
          return next
        })
        if (result?.error) { toast.error(result.error); return }
        toast.success('Featured service removed')
      } else {
        const result = await setFeaturedService(service.id)
        setFeaturingIds((prev) => {
          const next = new Set(prev)
          next.delete(service.id)
          return next
        })
        if (result?.error) { toast.error(result.error); return }
        toast.success('Featured service updated')
      }
    })
  }

  function handleDelete(id: number) {
    setDeletingIds((prev) => new Set(prev).add(id))
    startTransition(async () => {
      const result = await deleteServicePlan(id)
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      if (result?.error) { toast.error(result.error); return }
      toast.success('Service plan deleted')
    })
  }

  function handleToggle(id: number, value: boolean) {
    setTogglingIds((prev) => new Set(prev).add(id))
    startTransition(async () => {
      updateOptimistic({ id, value })
      const result = await toggleServicePlanAvailability(id, value)
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
    <Card>
      <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Subtitle</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Highlighted</TableHead>
            <TableHead>Available</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                No service plans found. Click &quot;Add Service Plan&quot; to create one.
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => {
              const isDeleting = deletingIds.has(service.id)
              const isToggling = togglingIds.has(service.id)
              const isFeaturing = featuringIds.has(service.id)
              const isSaving = savingIds.has(service.id)
              const isEditing = editingId === service.id
              const isAvailable = optimisticAvailability[service.id]
              const isBusy = isDeleting || isToggling || isFeaturing || isSaving

              return (
                <TableRow key={service.id} className={isDeleting ? 'opacity-50' : ''}>
                  <TableCell className="text-xs text-muted-foreground">
                    {service.id}
                  </TableCell>

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
                      <Badge variant={TYPE_BADGE[service.type as ServiceType]} className="capitalize">
                        {service.type}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    {isEditing ? (
                      <Input
                        className="h-8 w-32"
                        value={editState!.name}
                        onChange={(e) =>
                          setEditState((prev) => ({ ...prev!, name: e.target.value }))
                        }
                      />
                    ) : (
                      service.name
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <Input
                        className="h-8 w-36"
                        value={editState!.subtitle}
                        onChange={(e) =>
                          setEditState((prev) => ({ ...prev!, subtitle: e.target.value }))
                        }
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">{service.subtitle}</span>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    {isEditing ? (
                      <div className="flex flex-col gap-1">
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          className="h-8 w-28"
                          value={editState!.price}
                          onChange={(e) =>
                            setEditState((prev) => ({ ...prev!, price: e.target.value }))
                          }
                        />
                        <Input
                          placeholder="Price note (optional)"
                          className="h-8 w-28"
                          value={editState!.price_note}
                          onChange={(e) =>
                            setEditState((prev) => ({ ...prev!, price_note: e.target.value }))
                          }
                        />
                      </div>
                    ) : (
                      <div>
                        <span>${Number(service.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        {service.price_note && (
                          <span className="block text-xs text-muted-foreground">{service.price_note}</span>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="max-w-[180px]">
                    {isEditing ? (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          <Input
                            className="h-8"
                            placeholder="Add tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addEditTag()
                              }
                            }}
                          />
                          <Button type="button" size="sm" variant="outline" className="h-8" onClick={addEditTag}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {editState!.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeEditTag(tag)}
                                className="hover:text-destructive"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {service.tags.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          service.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editState!.highlighted}
                          onCheckedChange={(v) =>
                            setEditState((prev) => ({ ...prev!, highlighted: v }))
                          }
                        />
                        {editState!.highlighted && (
                          <span className="text-xs text-amber-600">Only one plan can be featured</span>
                        )}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant={service.highlighted ? 'default' : 'outline'}
                        className={service.highlighted ? 'bg-amber-500 hover:bg-amber-600 border-amber-500' : ''}
                        disabled={isBusy || isEditing}
                        onClick={() => handleSetFeatured(service)}
                      >
                        {isFeaturing ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Flag className="h-3 w-3 mr-1" />
                        )}
                        {isFeaturing ? '…' : service.highlighted ? 'Featured' : 'Set as Featured'}
                      </Button>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={editState!.is_available ? 'default' : 'outline'}
                        className={editState!.is_available ? 'bg-green-600 hover:bg-green-700 border-green-600' : ''}
                        onClick={() =>
                          setEditState((prev) => ({ ...prev!, is_available: !prev!.is_available }))
                        }
                      >
                        <Circle className={`h-2 w-2 mr-1.5 fill-current ${editState!.is_available ? '' : 'text-muted-foreground/50'}`} />
                        {editState!.is_available ? 'Active' : 'Inactive'}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant={isAvailable ? 'default' : 'outline'}
                        className={isAvailable ? 'bg-green-600 hover:bg-green-700 border-green-600' : ''}
                        disabled={isBusy}
                        onClick={() => handleToggle(service.id, !isAvailable)}
                      >
                        {isToggling ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <>
                            <Circle className={`h-2 w-2 mr-1.5 fill-current ${isAvailable ? '' : 'text-muted-foreground/50'}`} />
                            {isAvailable ? 'Active' : 'Inactive'}
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={isSaving}
                            onClick={() => handleSave(service.id)}
                          >
                            {isSaving ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            {isSaving ? 'Saving…' : 'Save'}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isSaving}
                            onClick={cancelEdit}
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isBusy || editingId !== null}
                            onClick={() => startEdit(service)}
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isBusy || editingId !== null}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                {isDeleting ? 'Deleting…' : 'Delete'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Service Plan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <strong>{service.name}</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  onClick={() => handleDelete(service.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
      </CardContent>
    </Card>
  )
}
