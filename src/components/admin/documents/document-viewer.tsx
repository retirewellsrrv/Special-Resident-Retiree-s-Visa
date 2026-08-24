'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ZoomIn, ZoomOut, Download, FileIcon, Loader2, ArrowLeft, User, Hash, FileText, Calendar, ExternalLink } from 'lucide-react'
import { getDocumentSignedUrl } from '@/actions/admin/documents'
import { documentTypeLabel } from './document-labels'
import type { DocumentForReview } from '@/actions/admin/documents'
import { cn } from '@/lib/utils'

// Lazy-load pdf.js so it stays out of the main bundle and never renders on
// the server (it relies on browser APIs).
const PdfViewer = dynamic(() => import('@/components/shared/pdf-viewer').then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-neutral-50 rounded-lg border border-brand-neutral-200">
      <Loader2 className="h-6 w-6 animate-spin text-brand-neutral-400" />
    </div>
  ),
})

interface Props {
  doc: DocumentForReview
  /** Shows a "Back to queue" button on mobile/tablet (stacked layout) */
  onBack?: () => void
}

export function DocumentViewer({ doc, onBack }: Props) {
  const [zoom, setZoom] = useState(1)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const urlCache = useRef<Map<string, string>>(new Map())

  const fetchUrl = useCallback(async () => {
    const cached = urlCache.current.get(doc.path)
    if (cached) {
      setSignedUrl(cached)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await getDocumentSignedUrl(doc.path)
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        urlCache.current.set(doc.path, result.url)
        setSignedUrl(result.url)
      } else {
        setError('Failed to generate document URL')
      }
    } catch {
      setError('Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [doc.path])

  useEffect(() => {
    let cancelled = false
    fetchUrl().then(() => {
      if (cancelled) {
        setSignedUrl(null)
        setLoading(true)
        setError(null)
      }
    })
    return () => { cancelled = true }
  }, [fetchUrl])

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'].includes(doc.format)
  const isPdf = doc.format === 'pdf'

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25))

  const uploadedDate = new Date(doc.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col flex-1 rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0">
      <div className="px-4 py-3 border-b border-brand-neutral-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {onBack && (
              <button
                onClick={onBack}
                className="lg:hidden inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 -ml-2 text-xs font-medium text-brand-neutral-500 hover:bg-brand-neutral-50 hover:text-brand-neutral-800 transition-colors"
                aria-label="Back to review queue"
              >
                <ArrowLeft className="size-3.5" />
                Queue
              </button>
            )}
            <h3 className="text-base font-semibold text-brand-neutral-900 truncate">
              {doc.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Zoom controls — the PdfViewer provides its own zoom for PDFs */}
            <div className={cn('flex items-center gap-1', isPdf && 'hidden')}>
              <button
                onClick={zoomOut}
                disabled={zoom <= 0.25}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs text-brand-neutral-500 w-10 text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={zoom >= 3}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="w-px h-5 bg-brand-neutral-200 mx-1" />
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 transition-colors"
                title="Open in new tab"
                aria-label="Open document in new tab"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Metadata strip */}
        <dl className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-neutral-500">
          <div className="flex items-center gap-1 min-w-0">
            <User className="size-3 shrink-0" />
            <span className="truncate">{doc.applicant_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Hash className="size-3 shrink-0" />
            <span className="font-mono">{doc.application_code}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="size-3 shrink-0" />
            <span>{documentTypeLabel(doc.type)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileIcon className="size-3 shrink-0" />
            <span className="uppercase">{doc.format}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="size-3 shrink-0" />
            <span>{uploadedDate}</span>
          </div>
          {doc.application_id && (
            <a
              href={`/admin/applications?app=${doc.application_id}`}
              className="inline-flex items-center gap-1 font-medium text-brand-primary-600 hover:text-brand-primary-800 hover:underline"
            >
              <ExternalLink className="size-3 shrink-0" />
              View application
            </a>
          )}
        </dl>
      </div>

      <div className="flex-1 overflow-auto bg-brand-neutral-50 flex items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs">Loading document...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
            <FileIcon className="h-8 w-8" />
            <span className="text-xs">{error}</span>
          </div>
        ) : isImage ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              <img
                src={signedUrl!}
                alt={doc.name}
                className="max-w-full max-h-full rounded-lg shadow-sm object-contain"
              />
            </div>
            <p className="text-[11px] text-brand-neutral-400">
              Pinch or use the zoom controls to inspect details.
            </p>
          </div>
        ) : isPdf ? (
          /* In-app pdf.js viewer (canvas-based — works on iOS Safari) with
             its own zoom + page navigation. No new-tab handoff required. */
          <div className="w-full h-full min-h-0">
            <PdfViewer key={signedUrl} url={signedUrl} fileName={doc.name} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-brand-neutral-400">
            <FileIcon className="h-8 w-8" />
            <span className="text-xs">Preview not available for {doc.format.toUpperCase()} files.</span>
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
        )}
      </div>
    </div>
  )
}
