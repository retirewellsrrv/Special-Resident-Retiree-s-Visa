'use client'

import { useId, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createService } from '@/actions/admin/service'
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
import { Loader2, Plus } from 'lucide-react'

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

const DEFAULT_STATE = { type: 'basic' as ServiceType, price: '', description: '' }

export function ServiceForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [fields, setFields] = useState(DEFAULT_STATE)

  const typeId = useId()
  const priceId = useId()
  const descriptionId = useId()

  function set<K extends keyof typeof fields>(key: K, value: typeof fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setFields(DEFAULT_STATE)
    setOpen(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const parsedPrice = Number(fields.price)
    if (!fields.price || isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('Price must be a positive number')
      return
    }

    startTransition(async () => {
      const result = await createService({
        type: fields.type,
        price: parsedPrice,
        description: fields.description.trim() || null,
        is_available: true,
      })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success('Service created')
      reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Service</DialogTitle>
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
            <label htmlFor={priceId} className="text-sm font-medium">
              Price (₱)
            </label>
            <Input
              id={priceId}
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 1000"
              value={fields.price}
              onChange={(e) => set('price', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={descriptionId} className="text-sm font-medium">
              Description
              <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id={descriptionId}
              placeholder="Describe what this service includes…"
              value={fields.description}
              onChange={(e) => set('description', e.target.value)}
            />
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
                Create Service
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
