'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, X, Loader2 } from 'lucide-react'
import { DocumentPreview } from './document-preview'
import { DocumentActions } from './document-actions'
import { documentTypeLabel, type ReviewableDocument } from './document-meta'
import { StatusChip } from '@/components/ui/status-chip'
import { cn } from '@/lib/utils'

/**
 * Mobile (<lg) full-screen review workspace. Takes over the viewport with a
 * sticky top bar and the desktop decision rail pinned at the bottom so the
 * mobile review controls match the desktop layout. Navigation between
 * documents is done with floating prev/next buttons over the preview, plus
 * floating Accept/Reject quick actions (Reject primes the rail's note field
 * because a rejection reason is required).
 */

interface Props {
  doc: ReviewableDocument
  /** Current page rows — used to compute position for prev/next */
  docs: ReviewableDocument[]
  onBack: () => void
  onPrev: () => void
  onNext: () => void
  onSave: (docId: number, status: string, note: string) => Promise<boolean>
}

export function DocumentReviewMobile({ doc, docs, onBack, onPrev, onNext, onSave }: Props) {
  const position = docs.findIndex((d) => d.id === doc.id)
  const total = docs.length
  const canPrev = position > 0
  const canNext = position >= 0 && position < total - 1

  const [prime, setPrime] = useState<{ status: string; focusNote?: boolean } | null>(null)
  const [quickPending, setQuickPending] = useState<null | 'accepted'>(null)

  async function quickAccept() {
    if (quickPending) return
    setQuickPending('accepted')
    await onSave(doc.id, 'accepted', doc.review_note ?? '')
    setQuickPending(null)
  }

  function quickReject() {
    // Rejection always needs a fresh reason — prime the rail's note field.
    setPrime({ status: 'rejected', focusNote: true })
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-brand-neutral-50">
      {/* ── Sticky top bar ── */}
      <div className="flex h-14 items-center gap-2.5 px-3 bg-white border-b border-brand-neutral-200 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-brand-primary-600 text-sm font-semibold px-2 py-2 -ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Documents
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-neutral-900 truncate">
            {documentTypeLabel(doc.type)}
          </p>
          <p className="text-[11px] text-brand-neutral-400 truncate">
            {position >= 0 ? `${position + 1} of ${total}` : ''}
            {position >= 0 && doc.applicant_name ? ' · ' : ''}
            {doc.applicant_name}
          </p>
        </div>
        <StatusChip status={doc.status} className="shrink-0" />
      </div>

      {/* ── Preview with floating nav + quick decisions ── */}
      <div className="relative flex-1 min-h-0">
        <DocumentPreview doc={doc} className="rounded-none border-x-0 border-t-0" />

        {/* Floating previous */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous document"
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-11 rounded-full shadow-lg border transition-colors',
            canPrev
              ? 'bg-white border-brand-neutral-200 text-brand-primary-700 hover:bg-brand-neutral-50'
              : 'bg-brand-neutral-100 border-brand-neutral-200 text-brand-neutral-300 cursor-default',
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Floating next */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next document"
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-11 rounded-full shadow-lg border transition-colors',
            canNext
              ? 'bg-white border-brand-neutral-200 text-brand-primary-700 hover:bg-brand-neutral-50'
              : 'bg-brand-neutral-100 border-brand-neutral-200 text-brand-neutral-300 cursor-default',
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Floating quick decisions — one-tap Accept, Reject primes the note */}
        <div className="absolute right-3 bottom-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={quickAccept}
            disabled={quickPending !== null}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-60',
              quickPending === 'accepted' ? 'bg-brand-neutral-400' : 'bg-green-600',
            )}
          >
            {quickPending === 'accepted' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Accept
          </button>
          <button
            type="button"
            onClick={quickReject}
            disabled={quickPending !== null}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white bg-red-600 shadow-lg transition-transform active:scale-95 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
      </div>

      {/* ── Bottom review rail — same component/design as the desktop rail ── */}
      <DocumentActions
        doc={doc}
        onSave={onSave}
        prime={prime}
        onPrimeHandled={() => setPrime(null)}
        className="shrink-0 max-h-[45vh] rounded-none border-0 border-t-2 border-brand-neutral-200"
      />
    </div>
  )
}