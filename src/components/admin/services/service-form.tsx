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
import { Loader2, Plus, X, Star } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface FieldState {
  name: string
  subtitle: string
  price: string
  price_note: string
  description: string
  tags: string[]
  highlighted: boolean
}

const DEFAULT_STATE: FieldState = {
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
    if (!fields.name.trim()) { toast.error('Name is required'); return }
    if (!fields.subtitle.trim()) { toast.error('Subtitle is required'); return }
    if (!fields.description.trim()) { toast.error('Description is required'); return }

    startTransition(async () => {
      const result = await createServicePlan({
        name: fields.name.trim(),
        subtitle: fields.subtitle.trim(),
        price: parsedPrice,
        price_note: fields.price_note.trim() || null,
        description: fields.description.trim(),
        tags: fields.tags,
        highlighted: fields.highlighted,
        is_available: true,
      })
      if (result?.error) { toast.error(result.error); return }
      toast.success('Service plan created')
      reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 text-brand-primary-50 text-sm font-medium rounded-md px-3.5 py-2 transition-colors">
          <Plus className="h-4 w-4" />
          Add service plan
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create service plan</DialogTitle>
          <DialogDescription>
            Add a new service package for applicants to choose from.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor={nameId} className="text-sm font-medium text-brand-neutral-700">Name</label>
            <Input id={nameId} placeholder="e.g. Basic SRRV" value={fields.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div className="space-y-2">
            <label htmlFor={subtitleId} className="text-sm font-medium text-brand-neutral-700">Subtitle</label>
            <Input id={subtitleId} placeholder="e.g. For active retirees" value={fields.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={priceId} className="text-sm font-medium text-brand-neutral-700">Price</label>
              <Input id={priceId} type="number" min="1" step="0.01" placeholder="e.g. 10000" value={fields.price} onChange={(e) => set('price', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor={priceNoteId} className="text-sm font-medium text-brand-neutral-700">
                Price note <span className="text-brand-neutral-400 font-normal">(optional)</span>
              </label>
              <Input id={priceNoteId} placeholder="e.g. Required deposit" value={fields.price_note} onChange={(e) => set('price_note', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={descriptionId} className="text-sm font-medium text-brand-neutral-700">Description</label>
            <Textarea id={descriptionId} placeholder="Describe what this service includes…" rows={3} value={fields.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-neutral-700">Tags</label>
            <div className="flex gap-2">
              <Input
                placeholder="Type a tag and press Add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {fields.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {fields.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-brand-neutral-100 text-brand-neutral-600 border border-brand-neutral-200 rounded-md px-2 py-0.5 text-xs">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-brand-primary-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-lg border p-4 transition-colors ${fields.highlighted ? 'border-amber-300 bg-amber-50' : 'border-brand-neutral-200'}`}>
            <div className="flex items-center gap-3">
              <Switch id="highlighted" checked={fields.highlighted} onCheckedChange={(v) => set('highlighted', v)} />
              <div className="flex-1">
                <label htmlFor="highlighted" className="text-sm font-medium cursor-pointer">Highlight this plan</label>
                <p className="text-xs text-brand-neutral-400 mt-0.5">Featured plans are shown prominently to applicants. Only one plan can be featured at a time.</p>
              </div>
              {fields.highlighted && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary-600 hover:bg-brand-primary-800 disabled:opacity-50 text-brand-primary-50 text-sm font-medium rounded-md px-4 py-2.5 transition-colors"
          >
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <><Plus className="h-4 w-4" /> Create service plan</>}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}