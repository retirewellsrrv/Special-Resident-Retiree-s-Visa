'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// The pdf.js worker is served as a static asset (see public/pdf.worker.min.mjs).
// Using a fixed path (instead of a bundler asset URL) keeps this working under
// both webpack and Turbopack without extra config.
//
// IMPORTANT: the worker file is copied from node_modules/pdfjs-dist (the direct
// dependency, pinned to the EXACT version react-pdf requires). If pdfjs-dist is
// ever upgraded, re-copy the worker (cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/)
// or the API/worker versions will mismatch and PDFs will fail to render.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

interface PdfViewerProps {
  /** Signed URL of the PDF file (nullable while it's still loading) */
  url: string | null
  /** Used for the open-in-new-tab accessibility label */
  fileName?: string
  className?: string
}

/**
 * In-app PDF viewer built on pdf.js. Renders to canvas (works on iOS Safari,
 * where iframes fail), fits the page to the container width by default and
 * provides zoom + page navigation. The admin never has to leave the app to
 * inspect a document.
 */
export function PdfViewer({ url, fileName = 'document', className }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [zoom, setZoom] = useState(1) // relative to fit-width (1 = fits)
  const [basePageWidth, setBasePageWidth] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Track the available width so the page fits the container by default.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => setContainerWidth(el.clientWidth - 32) // 2 × p-4
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleDocLoad = useCallback((pdf: { numPages: number }) => {
    setNumPages(pdf.numPages)
    setPageNumber(1)
    setError(null)
  }, [])

  const handlePageLoad = useCallback(
    (page: { getViewport: (opts: { scale: number }) => { width: number } }) => {
      setBasePageWidth((prev) => prev ?? page.getViewport({ scale: 1 }).width)
    },
    [],
  )

  const handleDocError = useCallback((err: Error) => {
    setError(err?.message ? `Couldn't load this PDF (${err.message})` : "Couldn't load this PDF")
  }, [])

  // Effective scale: fit-to-width × user zoom
  const scale = containerWidth && basePageWidth ? (containerWidth / basePageWidth) * zoom : zoom

  const goToPage = (n: number) => {
    setPageNumber(Math.min(Math.max(1, n), numPages ?? 1))
    scrollRef.current?.scrollTo({ top: 0 })
  }

  if (!url) return null

  return (
    <div
      className={cn(
        'flex h-full w-full min-h-0 flex-col overflow-hidden rounded-lg border border-brand-neutral-200 bg-white',
        className,
      )}
    >
      {/* ── Toolbar: zoom · page nav · open in new tab ── */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-brand-neutral-100 bg-brand-neutral-50/50 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
            disabled={zoom <= MIN_ZOOM}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="w-11 text-center text-xs text-brand-neutral-500 tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
            disabled={zoom >= MAX_ZOOM}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {numPages !== null && numPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
              title="Previous page"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-brand-neutral-500 tabular-nums">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => goToPage(pageNumber + 1)}
              disabled={pageNumber >= (numPages ?? 1)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 disabled:opacity-40 transition-colors"
              title="Next page"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand-neutral-200 text-brand-neutral-500 hover:bg-brand-neutral-50 transition-colors"
          title="Open in new tab"
          aria-label={`Open ${fileName} in a new tab`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* ── Page canvas ── */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto bg-brand-neutral-100">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle className="size-8 text-brand-neutral-400" />
            <p className="text-sm text-brand-neutral-500">{error}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setError(null)
                  setReloadKey((k) => k + 1)
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-brand-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-brand-neutral-700 hover:bg-brand-neutral-50 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Try again
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary-600 hover:bg-brand-primary-800 px-3.5 py-2 text-sm font-medium text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open PDF
              </a>
            </div>
          </div>
        ) : (
          <Document
            key={reloadKey}
            file={url}
            onLoadSuccess={handleDocLoad}
            onLoadError={handleDocError}
            loading={
              <div className="flex h-full flex-col items-center justify-center gap-2 text-brand-neutral-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Loading document...</span>
              </div>
            }
            error={
              <div className="flex h-full flex-col items-center justify-center gap-2 text-brand-neutral-400">
                <AlertTriangle className="size-6" />
                <span className="text-xs">Unable to load this PDF.</span>
              </div>
            }
          >
            <div className="flex min-h-full w-fit min-w-full items-start justify-center p-4">
              <Page
                pageNumber={pageNumber}
                scale={scale}
                onLoadSuccess={handlePageLoad}
                loading={
                  <div className="flex items-center gap-2 p-10 text-xs text-brand-neutral-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading page…
                  </div>
                }
              />
            </div>
          </Document>
        )}
      </div>
    </div>
  )
}