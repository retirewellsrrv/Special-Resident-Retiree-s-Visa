'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ZoomIn, ZoomOut, Download, FileIcon, Loader2 } from 'lucide-react'
import { getDocumentSignedUrl } from '@/actions/admin/documents'
import { documentTypeLabel, type ReviewableDocument } from './document-meta'
import { cn } from '@/lib/utils'

interface Props {
  doc: ReviewableDocument
  /** Extra classes for the outer card (e.g. flex-1 min-h-0 in a column) */
  className?: string
}

export function DocumentPreview({ doc, className }: Props) {
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

  // Reset zoom when switching to a different document
  useEffect(() => {
    setZoom(1)
  }, [doc.id])

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'].includes(doc.format)
  const isPdf = doc.format === 'pdf'

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25))

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-brand-neutral-200 bg-white overflow-hidden min-h-0',
        className,
      )}
    >
      <div className="px-4 py-3 border-b border-brand-neutral-100 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-brand-neutral-900 truncate">
            {documentTypeLabel(doc.type)}
          </h3>
          <p className="text-xs text-brand-neutral-400 mt-0.5 truncate">
            {doc.application_code && doc.applicant_name ? (
              <>
                {doc.application_code} &middot; {doc.applicant_name} &middot; {doc.name}
              </>
            ) : (
              doc.name
            )}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={zoomOut}
            disabled={zoom <= 0.25}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
            title="Zoom out"
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
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-5 bg-brand-neutral-200 mx-1" />
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 transition-colors"
              title="Open in new tab"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
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
        ) : isPdf ? (
          <iframe
            src={`${signedUrl}#view=fitH`}
            className="w-full h-[70vh] min-h-[480px] rounded-lg border-0"
            title={doc.name}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          />
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
