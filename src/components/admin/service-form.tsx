'use client'

import { useId, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createServicePlan } from '@/actions/admin/service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Loader2, Plus, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

type ServiceType = 'basic' | 'premium' | 'vip'

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
]

const TYPE_BADGE: Record<ServiceType, 'outline' | 'default' | 'destructive'> = {
  basic: 'outline',
  premium: 'default',
  vip: 'destructive',
}

interface FieldState {
  type: ServiceType
  name: string
  subtitle: string
  price: string
  price_note: string
  description: string
  tags: string[]
  highlighted: boolean
}

const DEFAULT_STATE: FieldState = {
  type: 'basic',
  name: '',
  subtitle: '',
  price: '',
  price_note: '',
  description: '',
  tags: [],
  highlighted: false,
}

export function ServiceForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [fields, setFields] = useState<FieldState>(DEFAULT_STATE)
  const [tagInput, setTagInput] = useState('')

  const typeId = useId()
  const nameId = useId()
  const subtitleId = useId()
  const priceId = useId()
  const priceNoteId = useId()
  const descriptionId = useId()

  function set<K extends keyof FieldState>(key: K, value: FieldState[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function addTag() {
    const trimmed = tagInput.trim()
    if (trimmed && !fields.tags.includes(trimmed)) {
      set('tags', [...fields.tags, trimmed])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    set('tags', fields.tags.filter((t) => t !== tag))
  }

  function reset() {
    setFields(DEFAULT_STATE)
    setTagInput('')
    setOpen(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const parsedPrice = Number(fields.price)
    if (!fields.price || isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('Price must be a positive number')
      return
    }
    if (!fields.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!fields.subtitle.trim()) {
      toast.error('Subtitle is required')
      return
    }
    if (!fields.description.trim()) {
      toast.error('Description is required')
      return
    }

    startTransition(async () => {
      const result = await createServicePlan({
        type: fields.type,
        name: fields.name.trim(),
        subtitle: fields.subtitle.trim(),
        price: parsedPrice,
        price_note: fields.price_note.trim() || null,
        description: fields.description.trim(),
        tags: fields.tags,
        highlighted: fields.highlighted,
        is_available: true,
      })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success('Service plan created')
      reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add Service Plan
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Service Plan</DialogTitle>
          <DialogDescription>
            Add a new service package for applicants to choose from.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor={typeId} className="text-sm font-medium">
              Service Type
            </label>
            <div className="flex items-center gap-3">
              <Select
                value={fields.type}
                onValueChange={(v) => set('type', v as ServiceType)}
              >
                <SelectTrigger id={typeId} className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant={TYPE_BADGE[fields.type]} className="capitalize shrink-0">
                {fields.type}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={nameId} className="text-sm font-medium">
              Name
            </label>
            <Input
              id={nameId}
              placeholder="e.g. Basic SRRV"
              value={fields.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={subtitleId} className="text-sm font-medium">
              Subtitle
            </label>
            <Input
              id={subtitleId}
              placeholder="e.g. FOR ACTIVE RETIREES"
              value={fields.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={priceId} className="text-sm font-medium">
                Price
              </label>
              <Input
                id={priceId}
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 10000"
                value={fields.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={priceNoteId} className="text-sm font-medium">
                Price Note
                <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                id={priceNoteId}
                placeholder="e.g. Required Deposit"
                value={fields.price_note}
                onChange={(e) => set('price_note', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={descriptionId} className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id={descriptionId}
              placeholder="Describe what this service includes…"
              rows={3}
              value={fields.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tags
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Type a tag and press Add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {fields.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {fields.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="highlighted"
              checked={fields.highlighted}
              onCheckedChange={(v) => set('highlighted', v)}
            />
            <label htmlFor="highlighted" className="text-sm font-medium cursor-pointer">
              Highlight this plan
            </label>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Service Plan
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
