"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Shared Modal Primitive — portal, scroll‑lock, focus‑trap, animations     */
/* -------------------------------------------------------------------------- */

interface ModalProps {
  /** Whether the modal should be visible */
  isOpen: boolean
  /** Called when the modal wants to close (Escape, backdrop click, close btn) */
  onClose: () => void
  children: ReactNode
  /** Extra classes on the outermost portal wrapper (backdrop layer) */
  overlayClassName?: string
  /** Extra classes on the content panel */
  className?: string
  /** Transition duration in ms (default 200) */
  duration?: number
}

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
  duration = 200,
}: ModalProps) {
  /* ---- animation state machine ---- */
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      // Double requestAnimationFrame ensures the browser has painted the
      // element before we apply the "visible" classes, so the CSS transition
      // actually runs.
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true)
        })
      })
      return () => cancelAnimationFrame(raf)
    } else {
      setVisible(false)
    }
  }, [isOpen])

  // Unmount *after* the exit animation finishes.
  useEffect(() => {
    if (!visible && mounted) {
      const timer = setTimeout(() => setMounted(false), duration)
      return () => clearTimeout(timer)
    }
  }, [visible, mounted, duration])

  /* ---- body scroll lock ---- */
  useEffect(() => {
    if (!mounted) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    // Use `position: relative` + `width: 100%` guard for scrollbar-gap
    // shift on some OSs (optional, kept minimal here).
    return () => {
      document.body.style.overflow = original
    }
  }, [mounted])

  /* ---- Escape key ---- */
  useEffect(() => {
    if (!mounted) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mounted, onClose])

  /* ---- minimal focus trap ---- */
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mounted) return
    const prev = document.activeElement as HTMLElement | null

    // Focus the first focusable child, or the panel itself.
    const panel = contentRef.current
    if (panel) {
      const focusable = panel.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      ;(focusable ?? panel).focus()
    }

    return () => prev?.focus()
  }, [mounted])

  /* ---- backdrop click ---- */
  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  /* -------------------------------------------------- */
  /*  Render                                            */
  /* -------------------------------------------------- */

  if (!mounted) return null
  if (typeof window === "undefined") return null

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6",
        overlayClassName,
      )}
      style={{ transitionDuration: `${duration}ms` }}
      onClick={handleBackdrop}
    >
      {/* ---- backdrop ---- */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-md",
          "transition-opacity",
          visible ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDuration: `${duration}ms` }}
        aria-hidden="true"
      />

      {/* ---- content panel ---- */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full outline-none",
          "transition-all",
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-[0.96] translate-y-2",
          className,
        )}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
