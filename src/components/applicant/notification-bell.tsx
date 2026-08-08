'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, Loader2, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMyNotifications, markNotificationsReadAction } from '@/actions/applicant/notifications'
import type { NotificationItem } from '@/actions/applicant/notifications'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unread = items.filter((n) => !n.is_read).length

  useEffect(() => {
    let active = true
    getMyNotifications().then((res) => {
      if (!active) return
      setItems(res.items)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [open])

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  async function handleMarkAllRead() {
    setMarking(true)
    await markNotificationsReadAction()
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarking(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-brand-neutral-500 hover:text-brand-neutral-800 hover:bg-brand-neutral-100 rounded-full size-9"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-brand-primary-600 text-[9px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-brand-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-brand-neutral-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-brand-neutral-800">Notifications</p>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={marking}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary-700 hover:text-brand-primary-800 disabled:opacity-50"
              >
                {marking ? <Loader2 className="size-3 animate-spin" /> : <CheckCheck className="size-3.5" />}
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-10 text-brand-neutral-400">
                <Loader2 className="size-6 animate-spin" />
                <p className="text-xs">Loading notifications…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-brand-neutral-400">
                <Inbox className="size-7" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-brand-neutral-100">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'px-4 py-3 text-sm leading-snug',
                      n.is_read ? 'text-brand-neutral-500' : 'bg-brand-primary-50/40 font-medium text-brand-neutral-800',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-primary-600" />}
                      <span>{n.notification}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}