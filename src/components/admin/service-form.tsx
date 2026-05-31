'use client'

import { useId, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createService } from '@/actions/admin/service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type ServiceType = 'basic' | 'premium' | 'vip'

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
]

const DEFAULT_STATE = { type: 'basic' as ServiceType, price: '', description: '' }

export function ServiceForm() {
  const [isPending, startTransition] = useTransition()
  const [fields, setFields] = useState(DEFAULT_STATE)

  // Stable IDs for label association
  const typeId = useId()
  const priceId = useId()
  const descriptionId = useId()

  function set<K extends keyof typeof fields>(key: K, value: typeof fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
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
      setFields(DEFAULT_STATE)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Service</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={typeId} className="text-sm font-medium">
              Service Type
            </label>
            <Select
              value={fields.type}
              onValueChange={(v) => set('type', v as ServiceType)}
            >
              <SelectTrigger id={typeId}>
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
              placeholder="1000"
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
              placeholder="Service description…"
              value={fields.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2",
              "px-4 py-2.5 text-sm font-medium tracking-wide",
              "bg-neutral-900 text-white border border-neutral-900",
              "hover:bg-neutral-700 hover:border-neutral-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-150 rounded-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating…</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Create Service</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}