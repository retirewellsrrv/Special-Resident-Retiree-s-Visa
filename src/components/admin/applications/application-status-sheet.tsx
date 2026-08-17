'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

/**
 * Mobile bottom sheet for setting an application's status. Mirrors the
 * document decision sheet pattern: deliberate radio choices instead of a
 * raw select. The save action is delegated to the parent via `onSave`.
 */

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'paused', label: 'Paused' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'payment_failed', label: 'Payment Failed' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: string
  applicantName?: string
  applicationCode?: string
  onSave: (status: string) => Promise<boolean>
}

export function ApplicationStatusSheet({
  open,
  onOpenChange,
  currentStatus,
  applicantName,
  applicationCode,
  onSave,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)

  // Reset selection whenever the sheet opens or the application changes
  useEffect(() => {
    if (open) setSelectedStatus(currentStatus)
  }, [open, currentStatus])

  function handleConfirm() {
    startTransition(async () => {
      const ok = await onSave(selectedStatus)
      if (ok) onOpenChange(false)
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto w-full max-w-md rounded-t-2xl pb-6"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-brand-neutral-200 mt-3" aria-hidden />

        <SheetHeader>
          <SheetTitle>Set application status</SheetTitle>
          <SheetDescription>
            {applicantName}
            {applicationCode ? ` · ${applicationCode}` : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <span className="text-[11px] font-semibold text-brand-neutral-400 uppercase tracking-wider block mb-2">
            Application status
          </span>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = selectedStatus === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedStatus(opt.value)}
                  disabled={isPending}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-medium text-left transition-colors disabled:opacity-40',
                    isSelected
                      ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                      : 'border-brand-neutral-200 bg-white text-brand-neutral-700 hover:bg-brand-neutral-50',
                  )}
                  aria-pressed={isSelected}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3 px-4 mt-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1 rounded-lg border border-brand-neutral-200 bg-white text-brand-neutral-700 text-sm font-medium py-2.5 hover:bg-brand-neutral-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || selectedStatus === currentStatus}
            className="flex-1 rounded-lg bg-brand-primary-600 hover:bg-brand-primary-800 text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : 'Save Status'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}