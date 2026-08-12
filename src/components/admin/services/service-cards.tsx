'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Loader2, Star } from 'lucide-react'
import type { ServicePlan } from '@/types/services'
import { setFeaturedService, updateServicePlan } from '@/actions/admin/service'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

function TypeBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-brand-neutral-50 text-brand-neutral-500 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-neutral-400" />
      {name}
    </span>
  )
}

function AvailabilityDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${active ? 'text-green-600' : 'text-brand-neutral-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-brand-neutral-300'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

interface Props {
  services: ServicePlan[]
}

export function ServiceCards({ services }: Props) {
  const [, startTransition] = useTransition()
  const [featuringIds, setFeaturingIds] = useState<Set<number>>(new Set())

  const visible = useMemo(() => {
    return [...services]
      .sort((a, b) => a.id - b.id)
      .slice(0, 3)
  }, [services])

  if (!services.length) {
    return (
      <div className="text-center py-12 text-sm text-brand-neutral-400">
        No service plans available.
      </div>
    )
  }

  function handleSetFeatured(service: ServicePlan) {
    setFeaturingIds((prev) => new Set(prev).add(service.id))
    startTransition(async () => {
      const result = service.highlighted
        ? await updateServicePlan(service.id, { highlighted: false })
        : await setFeaturedService(service.id)
      setFeaturingIds((prev) => { const n = new Set(prev); n.delete(service.id); return n })
      if (result?.error) { toast.error(result.error); return }
      toast.success(service.highlighted ? 'Featured service removed' : 'Featured service updated')
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {visible.map((s) => (
        <Card
          key={s.id}
          size="sm"
          className={`rounded-2xl border border-neutral-200 shadow-sm bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${s.highlighted
            ? 'border-brand-primary-300 shadow-sm shadow-brand-primary-100 ring-brand-primary-200'
            : 'shadow-sm'
            }`}
        >
          <CardContent className="flex items-center justify-between">
            <TypeBadge name={s.name} />
            <AvailabilityDot active={s.is_available} />
          </CardContent>

          <CardContent>
            <p className="text-[11px] text-brand-neutral-400 font-medium tracking-wide mb-1.5">STARTING FROM</p>
            <p className="text-2xl font-semibold text-brand-neutral-900 leading-none tracking-tight">
              ${Number(s.price).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            {s.price_note && (
              <p className="text-xs text-brand-neutral-400 mt-1.5">{s.price_note}</p>
            )}
          </CardContent>

          <CardContent>
            <p className="text-sm font-semibold text-brand-neutral-900">{s.name}</p>
            <p className="text-xs text-brand-neutral-400 mt-0.5">{s.subtitle}</p>
          </CardContent>

          <CardContent>
            {s.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-brand-neutral-50 text-brand-neutral-500 border border-brand-neutral-100 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-brand-neutral-300">No tags added</p>
            )}
          </CardContent>

          <CardFooter className="justify-between bg-white/50">
            <button
              onClick={() => handleSetFeatured(s)}
              disabled={featuringIds.has(s.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 disabled:opacity-50 ${s.highlighted
                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                : 'border border-brand-neutral-200 text-brand-neutral-600 hover:text-brand-neutral-800 hover:bg-brand-neutral-50 hover:border-brand-neutral-300'
                }`}
            >
              {featuringIds.has(s.id)
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Star className={`h-3.5 w-3.5 ${s.highlighted ? 'fill-amber-400 text-amber-400' : ''}`} />
              }
              {featuringIds.has(s.id) ? '…' : s.highlighted ? 'Featured' : 'Set as featured'}
            </button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}