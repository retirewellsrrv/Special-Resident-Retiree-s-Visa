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
} from 'lucide-react'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { StatusChip } from '@/components/ui/status-chip'
import { getDocumentSignedUrl } from '@/actions/admin/documents'
import { updateDocumentReview } from '@/actions/admin/document-review'
import { documentTypeLabel } from '@/components/admin/documents/document-review/document-meta'
import type { AppDetail } from '@/actions/admin/applications-admin'

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
    const needsNote = currentStatus === 'rejected' || currentStatus === 'action need'
    if (needsNote && !currentNote.trim()) {
      toast.error('A review note is required when rejecting or requesting action from the applicant')
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
            className="!max-w-[75rem] w-[calc(100%-24px)] lg:w-[calc(100%-100px)] max-h-[calc(100vh-24px)] lg:max-h-[calc(100vh-100px)] h-auto min-h-[min(420px,100dvh)] p-0 flex flex-col gap-0 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            showCloseButton={false}
          >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-neutral-200 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
          <div className="min-w-0 flex-1">
            <DialogTitle className="sr-only">Document Review</DialogTitle>
            <p className="text-sm font-semibold text-brand-neutral-900 truncate">
              {currentDoc ? documentTypeLabel(currentDoc.type) : ''}
            </p>
            <p className="text-[11px] text-brand-neutral-400 truncate">
              {currentDoc?.name ?? ''}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-3">
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

        {/* ── Body: preview + sidebar ── */}
        <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
          {/* Document Preview */}
          <div className="h-1/2 lg:h-auto lg:flex-1 flex flex-col min-w-0">
            {/* Zoom controls */}
            <div className="flex items-center justify-end gap-1 px-5 py-2.5 border-b border-brand-neutral-100 shrink-0 bg-brand-neutral-50/50">
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                disabled={zoom <= 0.25}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
                title="Zoom out"
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
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-auto bg-brand-neutral-100 flex items-center justify-center p-4 ring-1 ring-inset ring-brand-neutral-200/50">
              {loadingPreview ? (
                <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-xs">Loading document...</span>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
                  <FileIcon className="h-8 w-8" />
                  <span className="text-xs">{previewError}</span>
                </div>
              ) : currentDoc && isImage ? (
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
              ) : currentDoc && isPdf ? (
                <iframe
                  src={`${signedUrl}#view=fitH`}
                  className="w-full h-full rounded-lg border border-brand-neutral-200"
                  title={currentDoc.name}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                  }}
                />
              ) : currentDoc ? (
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
              ) : null}
            </div>
          </div>

          {/* ── Sidebar: metadata + actions ── */}
          <div className="flex-1 lg:flex-none lg:w-[300px] shrink-0 border-t-2 border-brand-neutral-200 lg:border-t-0 lg:border-l-2 bg-white flex flex-col overflow-hidden min-h-0">
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
                        ? documentTypeLabel(currentDoc.type)
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

        {/* ── Bottom navigation ── */}
        <div className="flex items-center justify-center gap-4 px-6 py-4 border-t-2 border-brand-neutral-200 shrink-0 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
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
      </DialogContent>
    </Dialog>
  )
}
