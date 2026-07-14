'use client'

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { Search, X, Loader2 } from 'lucide-react'

interface FilterInputProps {
  label: string
  placeholder?: string
  defaultValue?: string
  onChange: (value: string) => void
  disabled?: boolean
  isPending?: boolean
  debounceMs?: number
}

export function FilterInput({
  label,
  placeholder,
  defaultValue = '',
  onChange,
  disabled,
  isPending,
  debounceMs = 400,
}: FilterInputProps) {
  const [value, setValue] = useState(defaultValue)
  const debouncedValue = useDebounce(value, debounceMs)
  const isFirstRender = useRef(true)
  const prevDefault = useRef(defaultValue)

  useEffect(() => {
    if (prevDefault.current !== defaultValue && defaultValue !== value) {
      setValue(defaultValue)
      prevDefault.current = defaultValue
    }
  }, [defaultValue])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (debouncedValue !== defaultValue) {
      onChange(debouncedValue)
    }
  }, [debouncedValue])

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-brand-neutral-500 font-semibold uppercase tracking-wide">{label}</label>
      <div className="relative">
        {isPending ? (
          <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-brand-primary-600" />
        ) : (
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-neutral-400" />
        )}
        <input
          type="text"
          placeholder={placeholder}
          aria-label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          className="h-9 w-full pl-8 pr-8 rounded-lg border border-brand-neutral-200 bg-white text-sm text-brand-neutral-900 outline-none focus:border-brand-primary-600 focus:ring-2 focus:ring-brand-primary-600/10 transition-all placeholder:text-brand-neutral-300 disabled:opacity-50 disabled:cursor-wait"
        />
        {value && (
          <button
            type="button"
            onClick={() => { setValue(''); onChange('') }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-neutral-400 hover:text-brand-neutral-600"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
