'use client'

import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import {
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileIcon,
  ZoomIn,
  ZoomOut,
  List,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { StatusChip } from '@/components/ui/status-chip'
import { getDocumentSignedUrl } from '@/actions/admin/documents'
import { updateDocumentReview } from '@/actions/admin/document-review'
import type { AppDetail } from '@/actions/admin/applications-admin'
import { cn } from '@/lib/utils'

// Lazy-load pdf.js so it stays out of the main bundle and never renders on
// the server (it relies on browser APIs).
const PdfViewer = dynamic(() => import('@/components/shared/pdf-viewer').then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-brand-neutral-200 bg-brand-neutral-50">
      <Loader2 className="h-6 w-6 animate-spin text-brand-neutral-400" />
    </div>
  ),
})

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  visa: 'Visa',
  nbi: 'NBI Clearance',
  pension: 'Pension Proof',
  medical: 'Medical Report',
}

interface Props {
  documents: AppDetail['documents']
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onDocumentsUpdated: (docId: number, newStatus: string) => void
}

export function DocumentReviewModal({
  documents,
  initialIndex,
  open,
  onOpenChange,
  onDocumentsUpdated,
}: Props) {
  const [isPending, startTransition] = useTransition()

  // Current document index
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const currentDoc = documents[currentIndex] ?? null

  // Per-document local state (status + note)
  const [statusMap, setStatusMap] = useState<Record<number, string>>({})
  const [noteMap, setNoteMap] = useState<Record<number, string>>({})

  // Mobile bottom sheets
  const [docsSheetOpen, setDocsSheetOpen] = useState(false)
  const [noteSheetOpen, setNoteSheetOpen] = useState(false)

  // Reset local state only when the modal opens (open → true) or initialIndex changes
  // (e.g. user clicks a different document). Do NOT reset on `documents` reference
  // changes, which happen on every data refresh and would undo auto-advance.
  const prevOpenRef = useRef(open)
  const prevInitialIndexRef = useRef(initialIndex)

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    const indexChanged = initialIndex !== prevInitialIndexRef.current

    if (justOpened || indexChanged) {
      setCurrentIndex(initialIndex)
      setStatusMap({})
      setNoteMap({})
      setDocsSheetOpen(false)
      setNoteSheetOpen(false)
    }

    prevOpenRef.current = open
    prevInitialIndexRef.current = initialIndex
  }, [open, initialIndex])

  // Signed URL for preview
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(true)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const urlCache = useRef<Map<string, string>>(new Map())
  const [zoom, setZoom] = useState(1)

  const fetchSignedUrl = useCallback(async (path: string) => {
    const cached = urlCache.current.get(path)
    if (cached) {
      setSignedUrl(cached)
      setLoadingPreview(false)
      setPreviewError(null)
      return
    }
    setLoadingPreview(true)
    setPreviewError(null)
    setZoom(1)
    try {
      const result = await getDocumentSignedUrl(path)
      if (result.error) {
        setPreviewError(result.error)
      } else if (result.url) {
        urlCache.current.set(path, result.url)
        setSignedUrl(result.url)
      } else {
        setPreviewError('Failed to generate document URL')
      }
    } catch {
      setPreviewError('Failed to load document')
    } finally {
      setLoadingPreview(false)
    }
  }, [])

  useEffect(() => {
    if (currentDoc) {
      fetchSignedUrl(currentDoc.path)
    }
  }, [currentDoc, fetchSignedUrl])

  const currentStatus = currentDoc
    ? statusMap[currentDoc.id] ?? currentDoc.status
    : 'pending'
  const currentNote = currentDoc
    ? noteMap[currentDoc.id] ?? currentDoc.review_note ?? ''
    : ''
  const statusChanged = currentDoc ? currentStatus !== currentDoc.status : false
  const noteChanged = currentDoc ? currentNote !== (currentDoc.review_note ?? '') : false
  const hasChanges = statusChanged || noteChanged

  const needsNote = currentStatus === 'rejected' || currentStatus === 'action need'

  const handleStatusChange = (value: string) => {
    if (!currentDoc) return
    setStatusMap((prev) => ({ ...prev, [currentDoc.id]: value }))
  }

  const handleNoteChange = (value: string) => {
    if (!currentDoc) return
    setNoteMap((prev) => ({ ...prev, [currentDoc.id]: value }))
  }

  const goNext = useCallback(() => {
    if (currentIndex < documents.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, documents.length])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }, [currentIndex])

  const handleSave = () => {
    if (!currentDoc) return

    // Enforce review note for rejection or action-needed
    if (needsNote && !currentNote.trim()) {
      toast.error('A review note is required when rejecting or requesting action from the applicant')
      setNoteSheetOpen(true)
      return
    }

    startTransition(async () => {
      const result = await updateDocumentReview(
        currentDoc.id,
        currentStatus,
        currentNote || null,
      )
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Document review saved')
      onDocumentsUpdated(currentDoc.id, currentStatus)
      // Auto-advance to next document, or close if this was the last one
      if (currentIndex < documents.length - 1) {
        goNext()
      } else {
        onOpenChange(false)
      }
    })
  }

  const isImage =
    currentDoc &&
    ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'].includes(
      currentDoc.format,
    )
  const isPdf = currentDoc?.format === 'pdf'

  /* ── Shared preview renderer — PDFs use the in-app pdf.js viewer ── */
  const renderPreviewContent = () => {
    if (loadingPreview) {
      return (
        <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs">Loading document...</span>
        </div>
      )
    }
    if (previewError) {
      return (
        <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
          <FileIcon className="h-8 w-8" />
          <span className="text-xs">{previewError}</span>
        </div>
      )
    }
    if (currentDoc && isImage) {
      return (
        <div
          className="flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={signedUrl!}
            alt={currentDoc.name}
            className="max-w-full max-h-full rounded-lg shadow-sm border border-brand-neutral-200 object-contain"
          />
        </div>
      )
    }
    if (currentDoc && isPdf) {
      // In-app pdf.js viewer (canvas-based — works on iOS Safari) with its
      // own zoom + page navigation. No new-tab handoff required.
      return (
        <div className="w-full h-full min-h-0">
          <PdfViewer key={signedUrl} url={signedUrl} fileName={currentDoc.name} />
        </div>
      )
    }
    if (currentDoc) {
      return (
        <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
          <FileIcon className="h-8 w-8" />
          <span className="text-xs">
            Preview not available for {currentDoc.format.toUpperCase()}{' '}
            files.
          </span>
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-primary-600 hover:underline mt-1"
            >
              Download file
            </a>
          )}
        </div>
      )
    }
    return null
  }

  const renderZoomControls = () => (
    <div className={cn('flex items-center justify-end gap-1 px-4 sm:px-5 py-2.5 border-b border-brand-neutral-100 shrink-0 bg-brand-neutral-50/50', isPdf && 'hidden')}>
      <button
        onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
        disabled={zoom <= 0.25}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <span className="text-xs text-brand-neutral-500 w-9 text-center tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
        disabled={zoom >= 3}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      {signedUrl && (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 transition-colors ml-1"
          title="Open in new tab"
          aria-label="Open document in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[75rem] w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100vh-100px)] h-auto min-h-[480px] p-0 flex flex-col gap-0 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-sm:!inset-0 max-sm:!w-full max-sm:!max-w-none max-sm:!h-dvh max-sm:!min-h-0 max-sm:!max-h-none max-sm:!rounded-none max-sm:!translate-x-0 max-sm:!translate-y-0"
        showCloseButton={false}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-brand-neutral-200 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
          <div className="min-w-0 flex-1">
            <DialogTitle className="sr-only">Document Review</DialogTitle>
            <p className="text-sm font-semibold text-brand-neutral-900 truncate">
              {currentDoc ? DOC_TYPE_LABELS[currentDoc.type] ?? currentDoc.type : ''}
            </p>
            <p className="text-[11px] text-brand-neutral-400 truncate">
              {currentDoc?.name ?? ''}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
            <span className="text-xs text-brand-neutral-400 tabular-nums">
              {currentIndex + 1} of {documents.length}
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-brand-neutral-400 hover:text-brand-neutral-600 hover:bg-brand-neutral-100 transition-colors"
              aria-label="Close review modal"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile body (< sm): full-height preview + sticky action dock ── */}
        <div className="sm:hidden flex-1 min-h-0 flex flex-col">
          {/* Document preview */}
          <div className="flex-1 flex flex-col min-h-0">
            {renderZoomControls()}
            <div className="flex-1 overflow-auto bg-brand-neutral-100 flex items-center justify-center p-4 ring-1 ring-inset ring-brand-neutral-200/50">
              {renderPreviewContent()}
            </div>
          </div>

          {/* Sticky action dock */}
          <div className="shrink-0 border-t-2 border-brand-neutral-200 bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                {statusChanged && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved change" />
                )}
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isPending}
                  aria-label="Document status"
                  className={cn(
                    'w-full text-[16px] rounded-lg border bg-white text-brand-neutral-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 disabled:opacity-40',
                    statusChanged ? 'border-amber-300 ring-1 ring-amber-200' : 'border-brand-neutral-200',
                  )}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="action need">Action Need</option>
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={isPending || !hasChanges}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 disabled:opacity-40 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
                title={!hasChanges ? 'All changes saved' : 'Save changes'}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : !hasChanges ? (
                  <CheckCircle2 className="h-4 w-4 text-green-200" />
                ) : null}
                {isPending ? 'Saving...' : !hasChanges ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Triage row: prev · document list · note · next */}
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={currentIndex <= 0}
                className="flex-1 inline-flex items-center justify-center rounded-md border border-brand-neutral-200 bg-white px-3 py-2 text-brand-neutral-700 hover:bg-brand-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous document"
                title="Previous document"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDocsSheetOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-brand-neutral-200 bg-white px-3 py-2 text-sm font-medium text-brand-neutral-700 hover:bg-brand-neutral-50 transition-colors"
              >
                <List className="h-4 w-4" />
                Docs
              </button>
              <button
                onClick={() => setNoteSheetOpen(true)}
                className={cn(
                  'flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-brand-neutral-200 bg-white px-3 py-2 text-sm font-medium text-brand-neutral-700 hover:bg-brand-neutral-50 transition-colors',
                  needsNote && 'border-red-300 text-red-700',
                  noteChanged && !needsNote && 'border-amber-300 text-amber-700',
                )}
              >
                <MessageSquare className="h-4 w-4" />
                Note
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex >= documents.length - 1}
                className="flex-1 inline-flex items-center justify-center rounded-md border border-brand-neutral-200 bg-white px-3 py-2 text-brand-neutral-700 hover:bg-brand-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next document"
                title="Next document"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── sm+ body: preview + sidebar ── */}
        <div className="hidden sm:flex flex-1 min-h-0 flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* Document Preview */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 h-56 lg:h-auto">
            {renderZoomControls()}
            <div className="flex-1 overflow-auto bg-brand-neutral-100 flex items-center justify-center p-4 ring-1 ring-inset ring-brand-neutral-200/50">
              {renderPreviewContent()}
            </div>
          </div>

          {/* ── Sidebar: metadata + actions ── */}
          <div className="w-full lg:w-[300px] shrink-0 border-t-2 lg:border-t-0 lg:border-l-2 border-brand-neutral-200 bg-white flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Document metadata */}
              <div>
                <h4 className="text-[11px] font-semibold text-brand-neutral-400 uppercase tracking-wider mb-2">
                  Document Info
                </h4>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-brand-neutral-400">Type</dt>
                    <dd className="text-brand-neutral-900 font-medium">
                      {currentDoc
                        ? DOC_TYPE_LABELS[currentDoc.type] ?? currentDoc.type
                        : '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-brand-neutral-400">File</dt>
                    <dd className="text-brand-neutral-900 truncate max-w-[160px] text-right">
                      {currentDoc?.name ?? '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-brand-neutral-400">Format</dt>
                    <dd className="text-brand-neutral-900 uppercase">
                      {currentDoc?.format ?? '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-brand-neutral-400">Status</dt>
                    <dd>
                      {currentDoc && (
                        <StatusChip status={currentDoc.status} />
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border-t border-brand-neutral-100" />

              {/* Status change */}
              <div>
                <label className="text-[11px] font-semibold text-brand-neutral-400 uppercase tracking-wider block mb-2">
                  Change Status
                </label>
                <div className="relative">
                  {statusChanged && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved change" />
                  )}
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isPending}
                    aria-label="Document status"
                    className={`w-full text-sm rounded-lg border bg-white text-brand-neutral-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 disabled:opacity-40 ${
                      statusChanged ? 'border-amber-300 ring-1 ring-amber-200' : 'border-brand-neutral-200'
                    }`}
                  >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="action need">Action Need</option>
                </select>
                </div>
              </div>

              {/* Review note (required for rejection / action need) */}
              <div>
                <label
                  htmlFor="review-note"
                  className="text-[11px] font-semibold text-brand-neutral-400 uppercase tracking-wider block mb-2"
                >
                  Review Note
                  {(currentStatus === 'rejected' ||
                    currentStatus === 'action need') && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  {noteChanged && (
                    <span className="absolute -left-3 top-3 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved change" />
                  )}
                  <textarea
                    id="review-note"
                    value={currentNote}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder={
                      currentStatus === 'rejected'
                        ? 'Reason for rejection...'
                        : currentStatus === 'action need'
                          ? 'What action is needed from the applicant...'
                          : 'Optional review note...'
                    }
                    rows={4}
                    disabled={isPending}
                    className={`w-full text-sm rounded-lg border bg-white text-brand-neutral-900 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 placeholder:text-brand-neutral-300 disabled:opacity-40 ${
                      noteChanged ? 'border-amber-300 ring-1 ring-amber-200' : 'border-brand-neutral-200'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-brand-neutral-400 mt-1">
                  {currentStatus === 'rejected' || currentStatus === 'action need'
                    ? 'A note is strongly recommended for this status.'
                    : 'Internal note visible to other admins.'}
                </p>
              </div>
            </div>

            {/* Save button pinned at bottom */}
            <div className="p-6 border-t-2 border-brand-neutral-200">
              <button
                onClick={handleSave}
                disabled={isPending || !hasChanges}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-primary-600 hover:bg-brand-primary-800 disabled:opacity-40 text-white text-sm font-medium rounded-md px-4 py-2.5 transition-colors"
                title={!hasChanges ? 'All changes saved' : 'Save changes'}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : !hasChanges ? (
                  <CheckCircle2 className="h-4 w-4 text-green-200" />
                ) : null}
                {isPending ? 'Saving...' : !hasChanges ? 'Saved' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>

        {/* ── sm+ bottom navigation ── */}
        <div className="hidden sm:flex items-center justify-center gap-4 px-6 py-4 border-t-2 border-brand-neutral-200 shrink-0 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
          <button
            onClick={goPrev}
            disabled={currentIndex <= 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-neutral-200 bg-white px-4 py-2 text-sm font-medium text-brand-neutral-700 hover:bg-brand-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-xs text-brand-neutral-400 tabular-nums">
            {currentIndex + 1} / {documents.length}
          </span>
          <button
            onClick={goNext}
            disabled={currentIndex >= documents.length - 1}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-neutral-200 bg-white px-4 py-2 text-sm font-medium text-brand-neutral-700 hover:bg-brand-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ── Mobile: document list bottom sheet ── */}
        <Sheet open={docsSheetOpen} onOpenChange={setDocsSheetOpen}>
          <SheetContent side="bottom" className="!h-[70dvh] p-0 gap-0 flex flex-col">
            <SheetHeader className="px-4 pb-2 pt-4">
              <SheetTitle>Application Documents</SheetTitle>
              <SheetDescription>Tap a document to jump to it</SheetDescription>
            </SheetHeader>
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-6 space-y-1">
              {documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setCurrentIndex(idx)
                    setDocsSheetOpen(false)
                  }}
                  className={cn(
                    'w-full text-left flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                    idx === currentIndex
                      ? 'bg-brand-primary-50/60 ring-1 ring-inset ring-brand-primary-200'
                      : 'hover:bg-brand-neutral-50',
                  )}
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand-neutral-50 text-brand-neutral-400 shrink-0">
                    <FileIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-neutral-900 truncate">
                      {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    </p>
                    <p className="text-xs text-brand-neutral-400 truncate">{doc.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {doc.review_note && doc.review_note.length > 0 && (
                      <MessageSquare className="h-3 w-3 text-amber-500" />
                    )}
                    <StatusChip status={doc.status} />
                  </div>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* ── Mobile: review note bottom sheet ── */}
        <Sheet open={noteSheetOpen} onOpenChange={setNoteSheetOpen}>
          <SheetContent side="bottom" className="px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] gap-0">
            <SheetHeader className="px-0 pt-0 pb-2">
              <SheetTitle>Review Note</SheetTitle>
              <SheetDescription>
                {currentStatus === 'rejected' || currentStatus === 'action need'
                  ? 'A note is required for this status.'
                  : 'Internal note visible to other admins.'}
              </SheetDescription>
            </SheetHeader>
            <div className="relative mt-2">
              {noteChanged && (
                <span className="absolute -left-3 top-3 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved change" />
              )}
              <textarea
                id="review-note-mobile"
                value={currentNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder={
                  currentStatus === 'rejected'
                    ? 'Reason for rejection...'
                    : currentStatus === 'action need'
                      ? 'What action is needed from the applicant...'
                      : 'Optional review note...'
                }
                rows={4}
                disabled={isPending}
                className={cn(
                  'w-full text-[16px] rounded-lg border bg-white text-brand-neutral-900 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 placeholder:text-brand-neutral-300 disabled:opacity-40',
                  noteChanged ? 'border-amber-300 ring-1 ring-amber-200' : 'border-brand-neutral-200',
                )}
              />
            </div>
          </SheetContent>
        </Sheet>
      </DialogContent>
    </Dialog>
  )
}