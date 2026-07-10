'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FilterSelectProps {
  label: string
  value?: string
  options: { value: string; label: string }[]
  placeholder?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function FilterSelect({ label, value, options, placeholder = 'All', onChange, disabled }: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-brand-neutral-500 font-semibold uppercase tracking-wide">{label}</label>
      <Select value={value ?? ''} onValueChange={(v) => onChange(v || '')}>
        <SelectTrigger className="h-9 w-full rounded-lg border-brand-neutral-200 focus:border-brand-primary-600 focus:ring-2 focus:ring-brand-primary-600/10" disabled={disabled}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="capitalize">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
